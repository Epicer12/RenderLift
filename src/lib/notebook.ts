import { RenderSettings } from "@/components/RenderForm";

export function generateNotebookJson(
    fileName: string, // e.g., "MyScene.blend"
    fileId: string, // ID of the uploaded file on Drive
    folderName: string, // e.g. "BlenderCloudRender/Job_123"
    settings: RenderSettings
) {
    const { version, startFrame, endFrame, format, device } = settings;

    // Blender download URL map
    const blenderUrls: Record<string, string> = {
        '3.6.2': 'https://download.blender.org/release/Blender3.6/blender-3.6.2-linux-x64.tar.xz',
        '4.2.0': 'https://download.blender.org/release/Blender4.2/blender-4.2.0-linux-x64.tar.xz',
        '4.5.3': 'https://download.blender.org/release/Blender4.5/blender-4.5.3-linux-x64.tar.xz',
    };

    const blenderUrl = blenderUrls[version] || blenderUrls['3.6.2'];
    const blenderArchive = blenderUrl.split('/').pop()!; // "blender-3.6.2-linux-x64.tar.xz"
    const blenderDir = blenderArchive.replace('.tar.xz', ''); // "blender-3.6.2-linux-x64"

    // Construct the cells
    const cells = [
        {
            cell_type: "markdown",
            metadata: {},
            source: [
                "# RenderLift - Cloud Render Job\n",
                `**File**: ${fileName}\n`,
                `**Settings**: Frames ${startFrame}-${endFrame} | ${format} | ${device}\n`,
                "Run the cells below to start rendering!"
            ]
        },
        {
            cell_type: "code",
            execution_count: null,
            metadata: {},
            outputs: [],
            source: [
                "# 1. Connect Google Drive\n",
                "from google.colab import drive\n",
                "drive.mount('/content/drive')"
            ]
        },
        {
            cell_type: "code",
            execution_count: null,
            metadata: {},
            outputs: [],
            source: [
                `# 2. Smart Install Blender ${version}\n`,
                "# Checks 'RenderLift/Blender' folder for cached versions to save time.\n",
                "\n",
                "import os\n",
                "import shutil\n",
                "\n",
                `CACHE_PATH = "/content/drive/MyDrive/RenderLift/Blender"\n`,
                `ARCHIVE_NAME = "${blenderArchive}"\n`,
                `CACHE_FILE = f"{CACHE_PATH}/{ARCHIVE_NAME}"\n`,
                `DOWNLOAD_URL = "${blenderUrl}"\n`,
                "\n",
                "# Create Cache Folder if needed\n",
                "if not os.path.exists(CACHE_PATH):\n",
                "    os.makedirs(CACHE_PATH, exist_ok=True)\n",
                "    print(f'Created cache folder: {CACHE_PATH}')\n",
                "\n",
                "# Check Cache\n",
                "if os.path.exists(CACHE_FILE):\n",
                "    print(f'Found cached Blender: {CACHE_FILE}')\n",
                "    shutil.copy(CACHE_FILE, f'/content/{ARCHIVE_NAME}')\n",
                "else:\n",
                "    print(f'Downloading Blender from {DOWNLOAD_URL}...')\n",
                "    !wget -nc {DOWNLOAD_URL}\n",
                "    print('Caching to Drive...')\n",
                "    shutil.copy(f'/content/{ARCHIVE_NAME}', CACHE_FILE)\n",
                "\n",
                "print('Extracting...')\n",
                `!tar xf {ARCHIVE_NAME}`
            ]
        },
        {
            cell_type: "code",
            execution_count: null,
            metadata: {},
            outputs: [],
            source: [
                `# 3. Run Render Command\n`,
                `# Output folder\n`,
                `output_dir = '/content/drive/MyDrive/${folderName}/Renders'\n`,
                `if not os.path.exists(output_dir):\n`,
                `    os.makedirs(output_dir)\n`,
                `\n`,
                `filename = '/content/drive/MyDrive/${folderName}/${fileName}'\n`,
                `output_path = f'{output_dir}/render_'\n`,
                `\n`,
                `# Proper path quoting for shell command\n`,
                `cmd = f"./${blenderDir}/blender -b '{filename}' -noaudio -E 'CYCLES' -F '${format}' -o '{output_path}' -s ${startFrame} -e ${endFrame} -a -- --cycles-device ${device}"\n`,
                `print(f'Executing: {cmd}')\n`,
                `!{cmd}`
            ]
        }
    ];

    // Full Notebook JSON Structure
    return {
        nbformat: 4,
        nbformat_minor: 0,
        metadata: {
            colab: {
                provenance: []
            },
            kernelspec: {
                name: "python3",
                display_name: "Python 3"
            },
            language_info: {
                name: "python"
            }
        },
        cells: cells
    };
}
