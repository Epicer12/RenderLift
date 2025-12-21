import { google } from 'googleapis';

export const getDriveClient = (accessToken: string) => {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    return google.drive({ version: 'v3', auth });
};

export async function findOrCreateFolder(drive: any, name: string, parentId?: string): Promise<string> {
    const query = [
        `mimeType = 'application/vnd.google-apps.folder'`,
        `name = '${name}'`,
        `trashed = false`,
        parentId ? `'${parentId}' in parents` : `'root' in parents`
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

export async function listFolders(drive: any, parentId: string) {
    const response = await drive.files.list({
        q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: "files(id, name, createdTime)",
        orderBy: "createdTime desc",
    });
    return response.data.files || [];
}

export async function deleteFile(drive: any, fileId: string) {
    return await drive.files.delete({ fileId });
}

export async function renameFile(drive: any, fileId: string, newName: string) {
    return await drive.files.update({
        fileId: fileId,
        requestBody: { name: newName },
    });
}
