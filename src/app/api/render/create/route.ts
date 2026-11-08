import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDriveClient, readLiftConfig, upsertFile } from "@/lib/drive";
import { generateNotebookJson } from "@/lib/notebook";

// POST /api/render/create
//   New lift:  { fileId, fileName, settings }  (the file was just uploaded into its lift folder)
//   Re-render: { liftId, settings }            (source file and name come from the lift's render_config.json)
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { settings } = body;
        const rerender = typeof body.liftId === "string" && body.liftId.length > 0;

        const drive = getDriveClient(session.accessToken);

        let fileId: string | undefined = body.fileId;
        let fileName: string | undefined = body.fileName;
        let liftFolderId: string;

        if (rerender) {
            if (!settings) {
                return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
            }
            liftFolderId = body.liftId;
            const config = await readLiftConfig(drive, liftFolderId);
            if (!config?.fileId || !config?.fileName) {
                return NextResponse.json({ error: "This lift has no saved render settings to re-render from." }, { status: 404 });
            }
            fileId = config.fileId;
            fileName = config.fileName;
        } else {
            if (!fileId || !fileName || !settings) {
                return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
            }

            // 1. Get the File's Parent Folder (The Job Folder created during upload)
            const fileInfo = await drive.files.get({
                fileId: fileId,
                fields: 'parents'
            });

            const parents = fileInfo.data.parents;
            if (!parents || parents.length === 0) {
                return NextResponse.json({ error: "File has no parent folder" }, { status: 400 });
            }
            liftFolderId = parents[0];
        }

        // 2. Get Lift Folder Name (e.g. "My Scene")
        const liftFolderInfo = await drive.files.get({
            fileId: liftFolderId,
            fields: 'name'
        });
        const liftFolderName = liftFolderInfo.data.name;

        // 3. Construct Path for Colab
        // Structure enforced by Upload API: RenderLift/Lifts/[LiftFolderName]
        const fullFolderPath = `RenderLift/Lifts/${liftFolderName}`;

        // 4. Generate Notebook Content with Caching Logic
        const notebookJson = generateNotebookJson(fileName!, fileId!, fullFolderPath, settings, {
            runId: randomUUID(),
            archivePrevious: rerender,
        });

        // 5. Write the notebook into the SAME Lift Folder (a re-render replaces the existing one)
        const notebookFile = await upsertFile(
            drive,
            liftFolderId,
            "Render_Lift.ipynb",
            "application/vnd.google-colab",
            JSON.stringify(notebookJson, null, 2)
        );

        // 6. Save Lift Config for monitoring and for re-rendering later
        await upsertFile(
            drive,
            liftFolderId,
            "render_config.json",
            "application/json",
            JSON.stringify({
                fileName,
                fileId,
                settings,
                createdAt: new Date().toISOString(),
            }),
            "id"
        );

        console.log("RENDER_CREATE_SUCCESS: Returning liftId", liftFolderId);
        return NextResponse.json({
            success: true,
            liftId: liftFolderId,
            liftName: liftFolderName,
            notebookUrl: `https://colab.research.google.com/drive/${notebookFile.data.id}`
        });

    } catch (error) {
        console.error("Render Creation Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
