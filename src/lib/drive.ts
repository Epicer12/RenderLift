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

export async function listFolders(drive: drive_v3.Drive, parentId: string) {
    const response = await drive.files.list({
        q: `'${escapeQuery(parentId)}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: "files(id, name, createdTime)",
        orderBy: "createdTime desc",
    });
    return response.data.files || [];
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
