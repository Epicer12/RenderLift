import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDriveClient, readLiftConfig } from "@/lib/drive";

// GET /api/lifts/[liftId]/config - the file name and render settings a lift was last generated with
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
        const config = await readLiftConfig(drive, liftId);
        if (!config?.fileId || !config?.fileName || !config?.settings) {
            return NextResponse.json({ notFound: true }, { status: 404 });
        }
        return NextResponse.json({
            fileName: config.fileName,
            fileId: config.fileId,
            settings: config.settings,
        });
    } catch (error) {
        console.error("LiftConfigError:", (error as Error).message);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
