import { RenderSettings } from "@/components/RenderForm";

export function generateNotebookJson(
    fileName: string, // e.g., "MyScene.blend"
    fileId: string, // ID of the uploaded file on Drive
    folderName: string, // e.g. "BlenderCloudRender/Job_123"
    settings: RenderSettings
) {
    const { version, startFrame, endFrame, format, device, samples } = settings;

    // Blender download URL map
    const blenderUrls: Record<string, string> = {
        '2.83.20': 'https://download.blender.org/release/Blender2.83/blender-2.83.20-linux-x64.tar.xz',
        '2.93.18': 'https://download.blender.org/release/Blender2.93/blender-2.93.18-linux-x64.tar.xz',
        '3.3.15': 'https://download.blender.org/release/Blender3.3/blender-3.3.15-linux-x64.tar.xz',
        '3.6.13': 'https://download.blender.org/release/Blender3.6/blender-3.6.13-linux-x64.tar.xz',
        '4.0.2': 'https://download.blender.org/release/Blender4.0/blender-4.0.2-linux-x64.tar.xz',
        '4.1.1': 'https://download.blender.org/release/Blender4.1/blender-4.1.1-linux-x64.tar.xz',
        '4.2.0': 'https://download.blender.org/release/Blender4.2/blender-4.2.0-linux-x64.tar.xz',
        '4.3.0': 'https://download.blender.org/release/Blender4.3/blender-4.3.0-linux-x64.tar.xz',
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
                `# Configuration\n`,
                `samples = ${samples || 0}\n`,
                `start_frame = ${startFrame}\n`,
                `end_frame = ${endFrame}\n`,
                `device = '${device}'\n`,
                `format = '${format}'\n`,
                `blender_dir = '${blenderDir}'\n`,
                `\n`,
                `output_dir = '/content/drive/MyDrive/${folderName}/Renders'\n`,
                `if not os.path.exists(output_dir):\n`,
                `    os.makedirs(output_dir)\n`,
                `\n`,
                `filename = '/content/drive/MyDrive/${folderName}/${fileName}'\n`,
                `output_path = f'{output_dir}/render_'\n`,
                `\n`,
                `# Quality Override (Only if samples > 0)\n`,
                `quality_override = f'--python-expr "import bpy; bpy.context.scene.cycles.samples = {samples}; bpy.context.scene.eevee.taa_render_samples = {samples}"' if samples > 0 else ''\n`,
                `\n`,
                `# Construct final command\n`,
                `cmd = f"./{blender_dir}/blender -b '{filename}' -noaudio -E 'CYCLES' -F '{format}' -o '{output_path}' {quality_override} -s {start_frame} -e {end_frame} -a -- --cycles-device {device}"\n`,
                `print(f'Executing: {cmd}')\n`,
                `!{cmd}`
            ]
        }
    ];

    // 4. Optional Video Stitching (only if multi-frame and requested)
    if (endFrame > startFrame && settings.generateVideo) {
        cells.push({
            cell_type: "markdown",
            metadata: {},
            source: [
                "## 4. (Optional) Generate Video\n",
                "This step is **optional**. It will combine your rendered frames into a single MP4 video file using FFmpeg."
            ]
        });

        const extension = format.toLowerCase() === 'jpeg' ? 'jpg' : format.toLowerCase();

        cells.push({
            cell_type: "code",
            execution_count: null,
            metadata: {},
            outputs: [],
            source: [
                `# Generate MP4 Video\n`,
                `import os\n`,
                `output_dir = '/content/drive/MyDrive/${folderName}/Renders'\n`,
                `video_output = f'{output_dir}/render_animation.mp4'\n`,
                `fps = 24 # Change this if needed\n`,
                `\n`,
                `# Verify if frames exist\n`,
                `frames = [f for f in os.listdir(output_dir) if f.startswith('render_') and f.endswith(('.png', '.jpg', '.jpeg'))]\n`,
                `if frames:\n`,
                `    print(f'Found {len(frames)} frames. Generating video...')\n`,
                `    # Use ffmpeg to stitch frames\n`,
                `    # -framerate: frames per second\n`,
                `    # -pix_fmt yuv420p: Ensure compatibility with most players\n`,
                `    # -vf "pad...": Ensures width/height are even (required by libx264)\n`,
                `    !ffmpeg -y -framerate $fps -pattern_type glob -i "$output_dir/render_*.${extension}" -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -pix_fmt yuv420p "$video_output"\n`,
                `    \n`,
                `    if os.path.exists(video_output):\n`,
                `        print(f'SUCCESS: Video generated at: {video_output}')\n`,
                `    else:\n`,
                `        print('ERROR: Video generation failed. Check the logs above.')\n`,
                `else:\n`,
                `    print('No rendered frames found to generate video.')\n`
            ]
        });
    }

    // Full Notebook JSON Structure
    return {
        nbformat: 4,
        nbformat_minor: 4,
        metadata: {
            accelerator: "GPU",
            colab: {
                provenance: [],
                gpuClass: "standard"
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
