import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getDriveClient, findOrCreateFolder } from "@/lib/drive";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, type, size } = await req.json();

        if (!name || !type || !Number.isFinite(size) || size <= 0) {
            return NextResponse.json({ error: "Missing file metadata" }, { status: 400 });
        }

        const drive = getDriveClient(session.accessToken);

        // 1. Ensure Folder Structure: RenderLift -> Lifts -> Lift_[Timestamp]
        const rootId = await findOrCreateFolder(drive, "RenderLift");
        const liftsId = await findOrCreateFolder(drive, "Lifts", rootId);

        // Create a specific folder for this lift
        const liftName = `Lift_${Date.now()}`;
        const liftFolderId = await findOrCreateFolder(drive, liftName, liftsId);

        // 2. Initiate Resumable Upload Session
        // We use raw fetch here because we need the 'Location' header from the response
        const metadata = {
            name: name,
            mimeType: type,
            parents: [liftFolderId],
        };

        const origin = req.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";

        const initiateResponse = await fetch(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session.accessToken}`,
                    "Content-Type": "application/json",
                    "X-Upload-Content-Type": type,
                    "X-Upload-Content-Length": String(size), // Total bytes the browser will upload
                    "Origin": origin, // CRITICAL: Tells Google to allow CORS for this origin
                },
                body: JSON.stringify(metadata),
            }
        );

        if (!initiateResponse.ok) {
            const errText = await initiateResponse.text();
            throw new Error(`Failed to initiate upload: ${errText}`);
        }

        const uploadUrl = initiateResponse.headers.get("Location");

        if (!uploadUrl) {
            throw new Error("No upload link received from Google");
        }

        return NextResponse.json({ uploadUrl });

    } catch (error) {
        console.error("Upload Init Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
