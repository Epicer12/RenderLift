import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getDriveClient, findOrCreateFolder } from "@/lib/drive";
import { Readable } from "stream";

// Helper to convert Web Stream/Buffer to Node Readable stream for Google Drive API
function webToNodeStream(webStream: ReadableStream | ArrayBuffer) {
    if (webStream instanceof ArrayBuffer) {
        return Readable.from(Buffer.from(webStream));
    }
    return Readable.fromWeb(webStream as any);
}

import { authOptions } from "@/lib/auth";


export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions) as any;

    if (!session || !session.accessToken) {
        console.log("Upload Check: No session or token found", { session });
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Upload Check: Token present, length:", session.accessToken.length);

    try {
        const { name, type } = await req.json();

        if (!name || !type) {
            return NextResponse.json({ error: "Missing file metadata" }, { status: 400 });
        }

        const drive = getDriveClient(session.accessToken);

        // 1. Ensure Folder Structure: RenderLift -> Jobs -> Job_[Timestamp]
        const rootId = await findOrCreateFolder(drive, "RenderLift");
        const jobsId = await findOrCreateFolder(drive, "Jobs", rootId);

        // Create a specific folder for this job
        const jobName = `Job_${Date.now()}`;
        const jobFolderId = await findOrCreateFolder(drive, jobName, jobsId);

        // 2. Initiate Resumable Upload Session
        // We use raw fetch here because we need the 'Location' header from the response
        const metadata = {
            name: name,
            mimeType: type,
            parents: [jobFolderId],
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
                    "X-Upload-Content-Length": "0", // For initiation, the content length of the metadata is 0
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

    } catch (error: any) {
        console.error("Upload Init Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
