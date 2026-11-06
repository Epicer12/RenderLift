import { google, drive_v3 } from 'googleapis';

export const getDriveClient = (accessToken: string) => {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    return google.drive({ version: 'v3', auth });
};

// Escape a value for use inside a single-quoted Drive query string
export const escapeQuery = (value: string) => value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

export async function findOrCreateFolder(drive: drive_v3.Drive, name: string, parentId?: string): Promise<string> {
    const query = [
        `mimeType = 'application/vnd.google-apps.folder'`,
        `name = '${escapeQuery(name)}'`,
        `trashed = false`,
        parentId ? `'${escapeQuery(parentId)}' in parents` : `'root' in parents`
    ].join(' and ');

    const search = await drive.files.list({
        q: query,
        fields: "files(id)",
    });

    if (search.data.files && search.data.files.length > 0) {
        return search.data.files[0].id!;
    }

    const folder = await drive.files.create({
        requestBody: {
            name,
            mimeType: "application/vnd.google-apps.folder",
            parents: parentId ? [parentId] : undefined,
        },
        fields: "id",
    });

    return folder.data.id!;
}

// Always makes a new folder, with " (2)", " (3)" ... added if a sibling already has the name.
// (findOrCreateFolder would reuse the existing folder, mixing two lifts in one place.)
export async function createUniqueFolder(drive: drive_v3.Drive, baseName: string, parentId: string): Promise<{ id: string; name: string }> {
    for (let n = 1; n <= 50; n++) {
        const name = n === 1 ? baseName : `${baseName} (${n})`;
        const existing = await drive.files.list({
            q: `'${escapeQuery(parentId)}' in parents and name = '${escapeQuery(name)}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
            fields: "files(id)",
            pageSize: 1,
        });
        if (existing.data.files && existing.data.files.length > 0) continue;

        const folder = await drive.files.create({
            requestBody: { name, mimeType: "application/vnd.google-apps.folder", parents: [parentId] },
            fields: "id",
        });
        return { id: folder.data.id!, name };
    }
    // Absurdly many copies: fall back to a unique timestamp name
    const name = `${baseName} (${Date.now()})`;
    const folder = await drive.files.create({
        requestBody: { name, mimeType: "application/vnd.google-apps.folder", parents: [parentId] },
        fields: "id",
    });
    return { id: folder.data.id!, name };
}

export async function listFolders(drive: drive_v3.Drive, parentId: string) {
    const response = await drive.files.list({
        q: `'${escapeQuery(parentId)}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: "files(id, name, createdTime)",
        orderBy: "createdTime desc",
    });
    return response.data.files || [];
}

// Newest file with this name directly inside a folder, or null.
export async function findFileInFolder(drive: drive_v3.Drive, folderId: string, name: string) {
    const res = await drive.files.list({
        q: `'${escapeQuery(folderId)}' in parents and name = '${escapeQuery(name)}' and trashed = false`,
        fields: "files(id, name)",
        orderBy: "modifiedTime desc",
        pageSize: 1,
    });
    return res.data.files?.[0] ?? null;
}

// Replace the contents of the named file in a folder, or create it if it isn't there yet.
export async function upsertFile(
    drive: drive_v3.Drive,
    folderId: string,
    name: string,
    mimeType: string,
    body: string,
    fields = "id, webViewLink"
) {
    const existing = await findFileInFolder(drive, folderId, name);
    const media = { mimeType: "application/json", body };
    if (existing?.id) {
        return await drive.files.update({ fileId: existing.id, media, fields });
    }
    return await drive.files.create({
        requestBody: { name, mimeType, parents: [folderId] },
        media,
        fields,
    });
}

// The settings a lift was last generated with (render_config.json), or null.
export async function readLiftConfig(drive: drive_v3.Drive, folderId: string) {
    const file = await findFileInFolder(drive, folderId, "render_config.json");
    if (!file?.id) return null;
    const res = await drive.files.get({ fileId: file.id, alt: "media" }, { responseType: "text" });
    const text = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
    return JSON.parse(text) as { fileName?: string; fileId?: string; settings?: unknown };
}

export async function deleteFile(drive: drive_v3.Drive, fileId: string) {
    return await drive.files.delete({ fileId });
}

export async function renameFile(drive: drive_v3.Drive, fileId: string, newName: string) {
    return await drive.files.update({
        fileId: fileId,
        requestBody: { name: newName },
    });
}
