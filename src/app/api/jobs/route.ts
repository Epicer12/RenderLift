import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDriveClient, findOrCreateFolder, listFolders, deleteFile, renameFile } from "@/lib/drive";

// GET /api/jobs - List all jobs
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const drive = getDriveClient((session as any).accessToken);

        // Find RenderLift/Jobs
        const rootId = await findOrCreateFolder(drive, "RenderLift");
        const jobsId = await findOrCreateFolder(drive, "Jobs", rootId);

        const jobs = await listFolders(drive, jobsId);

        return NextResponse.json({ jobs });
    } catch (error: any) {
        console.error("ListJobsError", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/jobs - Delete a job
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await req.json();
    if (!jobId) {
        return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    try {
        const drive = getDriveClient((session as any).accessToken);
        await deleteFile(drive, jobId);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DeleteJobError", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/jobs - Rename a job
export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, newName } = await req.json();
    if (!jobId || !newName) {
        return NextResponse.json({ error: "Job ID and New Name required" }, { status: 400 });
    }

    try {
        const drive = getDriveClient((session as any).accessToken);
        await renameFile(drive, jobId, newName);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("RenameJobError", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
