import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDriveClient, findOrCreateFolder, escapeQuery } from "@/lib/drive";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ liftId: string }> }
) {
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { liftId } = await params;

    try {
        const drive = getDriveClient(session.accessToken);

        // 1. Find the lift folder
        let liftFolder: any = null;
        try {
            const res = await drive.files.get({ fileId: liftId, fields: "id, name" });
            liftFolder = res.data;
        } catch {
            const rootId = await findOrCreateFolder(drive, "RenderLift");
            const liftsId = await findOrCreateFolder(drive, "Lifts", rootId);
            const nameSearch = await drive.files.list({
                q: `'${liftsId}' in parents and name = '${escapeQuery(liftId)}' and trashed = false`,
                fields: "files(id, name)",
            });
            if (nameSearch.data.files && nameSearch.data.files.length > 0) {
                liftFolder = nameSearch.data.files[0];
            } else {
                return NextResponse.json({ notFound: true }, { status: 404 });
            }
        }

        const liftFolderId = liftFolder.id!;

        // 2. Find Renders folder - try multiple methods
        let rendersFolderId = null;

        // Method 1: Direct search by name
        const directSearch = await drive.files.list({
            q: `name = 'Renders' and '${liftFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
            fields: "files(id)",
        });

        if (directSearch.data.files && directSearch.data.files.length > 0) {
            rendersFolderId = directSearch.data.files[0].id!;
        } else {
            // Method 2: List all and find
            const allFiles = await drive.files.list({
                q: `'${liftFolderId}' in parents and trashed = false`,
                fields: "files(id, name, mimeType)",
            });

            const rendersFolder = allFiles.data.files?.find(f =>
                f.name?.toLowerCase() === 'renders' &&
                f.mimeType === 'application/vnd.google-apps.folder'
            );

            if (rendersFolder) {
                rendersFolderId = rendersFolder.id!;
            }
        }

        let finalVideo = null;
        let latestFrame = null;

        // 3. Get files from Renders folder if found
        if (rendersFolderId) {
            const files = await drive.files.list({
                q: `'${rendersFolderId}' in parents and trashed = false`,
                fields: "files(id, name, webViewLink, thumbnailLink, mimeType)",
                orderBy: "createdTime desc",
            });

            // Find video
            const video = files.data.files?.find(f => f.name?.toLowerCase().endsWith('.mp4'));
            if (video) {
                finalVideo = video;
            }

            // Find latest image
            const image = files.data.files?.find(f =>
                f.mimeType?.startsWith('image/') ||
                f.name?.match(/\.(jpg|jpeg|png)$/i)
            );
            if (image) {
                latestFrame = image;
            }
        }

        return NextResponse.json({
            liftId: liftFolderId,
            name: liftFolder.name,
            finalVideo,
            latestFrame
        });

    } catch (error: any) {
        console.error("API Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
