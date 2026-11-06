import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDriveClient, findOrCreateFolder, escapeQuery } from "@/lib/drive";
import { drive_v3 } from "googleapis";
import { computeLiftStatus } from "@/lib/liftStatus";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ liftId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { liftId } = await params;

    try {
        const drive = getDriveClient(session.accessToken);

        // 1. Find the lift folder
        let liftFolder: drive_v3.Schema$File | null = null;
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

        if (!liftFolder?.id) {
            return NextResponse.json({ notFound: true }, { status: 404 });
        }
        const liftFolderId = liftFolder.id;

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

        let finalVideo: drive_v3.Schema$File | null = null;
        let latestFrame: drive_v3.Schema$File | null = null;
        let frameCount = 0;

        // 3. Get files from Renders folder if found
        if (rendersFolderId) {
            const files = await drive.files.list({
                q: `'${rendersFolderId}' in parents and trashed = false`,
                fields: "files(id, name, webViewLink, thumbnailLink, mimeType, modifiedTime)",
                orderBy: "modifiedTime desc",
                pageSize: 1000,
            });
            const all = files.data.files ?? [];

            // Find video
            finalVideo = all.find(f => f.name?.toLowerCase().endsWith('.mp4')) ?? null;

            // Frames are the images, newest first
            const frames = all.filter(f =>
                f.mimeType?.startsWith('image/') ||
                f.name?.match(/\.(jpg|jpeg|png)$/i)
            );
            frameCount = frames.length;
            latestFrame = frames[0] ?? null;
        }

        const latestFrameTime = latestFrame?.modifiedTime ?? null;
        const status = computeLiftStatus({ frameCount, hasVideo: !!finalVideo, latestFrameTime });

        return NextResponse.json({
            liftId: liftFolderId,
            name: liftFolder.name,
            finalVideo,
            latestFrame,
            frameCount,
            latestFrameTime,
            status,
        });

    } catch (error) {
        console.error("API Error:", (error as Error).message);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
