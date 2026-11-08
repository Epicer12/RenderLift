import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDriveClient, findOrCreateFolder, listFolders, deleteFile, renameFile } from "@/lib/drive";

// GET /api/lifts - List all lifts
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const drive = getDriveClient(session.accessToken);

        // Find RenderLift/Lifts
        const rootId = await findOrCreateFolder(drive, "RenderLift");
        const liftsId = await findOrCreateFolder(drive, "Lifts", rootId);

        const lifts = await listFolders(drive, liftsId);

        return NextResponse.json({ lifts });
    } catch (error) {
        console.error("ListLiftsError", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

// DELETE /api/lifts - Delete a lift
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { liftId } = await req.json();
    if (!liftId) {
        return NextResponse.json({ error: "Lift ID required" }, { status: 400 });
    }

    try {
        const drive = getDriveClient(session.accessToken);
        await deleteFile(drive, liftId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DeleteLiftError", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

// PATCH /api/lifts - Rename a lift
export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { liftId, newName } = await req.json();
    if (!liftId || !newName) {
        return NextResponse.json({ error: "Lift ID and New Name required" }, { status: 400 });
    }

    try {
        const drive = getDriveClient(session.accessToken);
        await renameFile(drive, liftId, newName);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("RenameLiftError", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
