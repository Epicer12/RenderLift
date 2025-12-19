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
        const jobFolderId = parents[0];

        // 2. Get Job Folder Name (e.g. "Job_123456789")
        const jobFolderInfo = await drive.files.get({
            fileId: jobFolderId,
            fields: 'name'
        });
        const jobFolderName = jobFolderInfo.data.name;

        // 3. Construct Path for Colab
        // Structure enforced by Upload API: RenderLift/Jobs/[JobFolderName]
        const fullFolderPath = `RenderLift/Jobs/${jobFolderName}`;

        // 4. Generate Notebook Content with Caching Logic
        const notebookJson = generateNotebookJson(fileName, fileId, fullFolderPath, settings);

        // 5. Upload Notebook to the SAME Job Folder
        const notebookFile = await drive.files.create({
            requestBody: {
                name: "Render_Job.ipynb",
                mimeType: "application/vnd.google-colab", // This mimeType makes it openable in Colab
                parents: [jobFolderId],
            },
            media: {
                mimeType: "application/json",
                body: JSON.stringify(notebookJson, null, 2),
            },
            fields: "id, webViewLink",
        });

        return NextResponse.json({
            success: true,
            jobId: jobFolderName,
            notebookUrl: notebookFile.data.webViewLink
        });

    } catch (error: any) {
        console.error("Render Creation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
