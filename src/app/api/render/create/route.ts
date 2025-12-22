import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDriveClient } from "@/lib/drive";
import { generateNotebookJson } from "@/lib/notebook";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions) as any;

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { fileId, fileName, settings } = await req.json();

        if (!fileId || !fileName || !settings) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const drive = getDriveClient(session.accessToken);

        // 1. Get the File's Parent Folder (The Job Folder created during upload)
        const fileInfo = await drive.files.get({
            fileId: fileId,
            fields: 'parents'
        });

        const parents = fileInfo.data.parents;
        if (!parents || parents.length === 0) {
            return NextResponse.json({ error: "File has no parent folder" }, { status: 400 });
        }
        const liftFolderId = parents[0];

        // 2. Get Lift Folder Name (e.g. "Lift_123456789")
        const liftFolderInfo = await drive.files.get({
            fileId: liftFolderId,
            fields: 'name'
        });
        const liftFolderName = liftFolderInfo.data.name;

        // 3. Construct Path for Colab
        // Structure enforced by Upload API: RenderLift/Lifts/[LiftFolderName]
        const fullFolderPath = `RenderLift/Lifts/${liftFolderName}`;

        // 4. Generate Notebook Content with Caching Logic
        const notebookJson = generateNotebookJson(fileName, fileId, fullFolderPath, settings);

        // 5. Upload Notebook to the SAME Lift Folder
        const notebookFile = await drive.files.create({
            requestBody: {
                name: "Render_Lift.ipynb",
                mimeType: "application/vnd.google-colab",
                parents: [liftFolderId],
            },
            media: {
                mimeType: "application/json",
                body: JSON.stringify(notebookJson, null, 2),
            },
            fields: "id, webViewLink",
        });

        // 6. Save Lift Config for monitoring
        await drive.files.create({
            requestBody: {
                name: "render_config.json",
                mimeType: "application/json",
                parents: [liftFolderId],
            },
            media: {
                mimeType: "application/json",
                body: JSON.stringify({
                    fileName,
                    fileId,
                    settings,
                    createdAt: new Date().toISOString(),
                }),
            },
        });

        console.log("RENDER_CREATE_SUCCESS: Returning liftId", liftFolderId);
        return NextResponse.json({
            success: true,
            liftId: liftFolderId,
            liftName: liftFolderName,
            notebookUrl: `https://colab.research.google.com/drive/${notebookFile.data.id}`
        });

    } catch (error: any) {
        console.error("Render Creation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
