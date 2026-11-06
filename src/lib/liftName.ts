// Folder name for a new lift, taken from the uploaded file's name.

const MAX_LENGTH = 80;

// "My Scene.blend" -> "My Scene". Characters that Drive folders or Colab paths dislike become "_".
// "$" and "`" are replaced too: the notebook's ffmpeg cell puts the folder path inside a shell string.
export function liftNameFromFile(fileName: string): string {
    const base = fileName.replace(/\.(blend|zip)$/i, "");
    const cleaned = base
        .replace(/[\\/:*?"<>|$`\u0000-\u001f]/g, "_")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, MAX_LENGTH)
        .replace(/[. ]+$/, ""); // no trailing dots or spaces
    return cleaned || "Lift";
}
