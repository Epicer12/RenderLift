import { RenderSettings } from "@/components/RenderForm";
import { blenderDownloadUrl } from "@/lib/blenderVersions";

// Python string literal for any value (JSON strings are valid Python strings),
// so names like "Tom's scene.blend" can't break the generated code.
const py = (value: string) => JSON.stringify(value);

const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    allowed.includes(value as T) ? value as T : fallback;

const toInt = (value: unknown, fallback: number) => {
    const n = Math.floor(Number(value));
    return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export function generateNotebookJson(
    fileName: string, // e.g., "MyScene.blend" or "MyProject.zip"
    fileId: string, // ID of the uploaded file on Drive
    folderName: string, // e.g. "BlenderCloudRender/Job_123"
    settings: RenderSettings,
    options: {
        // Identifies this generated notebook. A different id than the one stored in Renders/
        // means the notebook is a new run, so the previous output may need archiving.
        runId?: string,
        // True for re-renders: move the previous Renders/ aside instead of mixing old and new frames.
        archivePrevious?: boolean,
    } = {}
) {
    const runId = /^[A-Za-z0-9-]{1,64}$/.test(options.runId ?? '') ? options.runId! : 'initial';
    const archivePrevious = options.archivePrevious === true;
    // Settings arrive from the browser and end up as code, so only accept known values
    const engine = pick(settings.engine, ['SCENE', 'CYCLES', 'EEVEE'] as const, 'SCENE');
    const format = pick(settings.format, ['PNG', 'JPEG', 'OPEN_EXR'] as const, 'PNG');
    const device = pick(settings.device, ['CUDA', 'OPTIX', 'CPU'] as const, 'CUDA');
    const startFrame = toInt(settings.startFrame, 1);
    const endFrame = Math.max(startFrame, toInt(settings.endFrame, startFrame));
    const samples = toInt(settings.samples, 0);

    const blenderUrl = blenderDownloadUrl(settings.version);
    const blenderArchive = blenderUrl.split('/').pop()!; // "blender-4.2.23-linux-x64.tar.xz"
    const blenderDir = blenderArchive.replace('.tar.xz', ''); // "blender-4.2.23-linux-x64"
    const blenderVersion = blenderDir.split('-')[1];
    const liftDir = `/content/drive/MyDrive/${folderName}`;

    // Construct the cells
    const cells = [
        {
            cell_type: "markdown",
            metadata: {},
            source: [
                "# RenderLift - Cloud Render Lift\n",
                `**File**: ${fileName}\n`,
                `**Settings**: Frames ${startFrame}-${endFrame} | ${format} | ${engine === 'SCENE' ? 'Scene engine' : engine} | ${device}\n`,
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
                `# 2. Smart Install Blender ${blenderVersion}\n`,
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
                "# 3. Prepare Scene\n",
                "# For .zip uploads: extracts the project and finds the .blend inside.\n",
                "# A single .blend at the top of the zip (or inside one wrapper folder) is used automatically.\n",
                "# If it's unclear which one to render, type the file name here and re-run this cell.\n",
                "BLEND_CHOICE = \"\"  #@param {type:\"string\"}\n",
                "\n",
                "import os, glob, zipfile\n",
                "\n",
                `LIFT_DIR = ${py(liftDir)}\n`,
                `SOURCE_FILE = os.path.join(LIFT_DIR, ${py(fileName)})\n`,
                "\n",
                "if SOURCE_FILE.lower().endswith('.zip'):\n",
                "    extract_dir = '/content/scene'\n",
                "    if not os.path.exists(extract_dir):\n",
                "        print('Extracting project zip...')\n",
                "        with zipfile.ZipFile(SOURCE_FILE) as z:\n",
                "            z.extractall(extract_dir)\n",
                "    blends = sorted(p for p in glob.glob(f'{extract_dir}/**/*.blend', recursive=True) if '__MACOSX' not in p)\n",
                "    if BLEND_CHOICE:\n",
                "        blends = [p for p in blends if os.path.relpath(p, extract_dir) == BLEND_CHOICE or os.path.basename(p) == BLEND_CHOICE]\n",
                "    else:\n",
                "        # Auto-pick: exactly one .blend at the top level (linked libraries in subfolders are ignored).\n",
                "        # If the zip is one wrapper folder, look inside it instead.\n",
                "        top = extract_dir\n",
                "        entries = [e for e in os.listdir(extract_dir) if e != '__MACOSX']\n",
                "        if len(entries) == 1 and os.path.isdir(os.path.join(extract_dir, entries[0])):\n",
                "            top = os.path.join(extract_dir, entries[0])\n",
                "        top_blends = [p for p in blends if os.path.dirname(p) == top]\n",
                "        if len(top_blends) == 1:\n",
                "            blends = top_blends\n",
                "    if not blends:\n",
                "        raise RuntimeError('No .blend file found in the zip' + (f' matching {BLEND_CHOICE!r}' if BLEND_CHOICE else ''))\n",
                "    if len(blends) > 1:\n",
                "        print('This zip contains several .blend files:')\n",
                "        for p in blends:\n",
                "            print('  ' + os.path.relpath(p, extract_dir))\n",
                "        raise RuntimeError('Set BLEND_CHOICE above to the file you want to render, then run this cell again.')\n",
                "    blend_path = blends[0]\n",
                "else:\n",
                "    blend_path = SOURCE_FILE\n",
                "\n",
                "print(f'Scene: {blend_path}')"
            ]
        },
        {
            cell_type: "code",
            execution_count: null,
            metadata: {},
            outputs: [],
            source: [
                "%%writefile /content/renderlift_setup.py\n",
                "# 4. Render Overrides (applied by Blender after the scene loads)\n",
                "import bpy\n",
                "\n",
                `ENGINE = ${py(engine)}  # 'SCENE' keeps the engine saved in the .blend\n`,
                `SAMPLES = ${samples}  # 0 keeps the samples saved in the .blend\n`,
                "\n",
                "scene = bpy.context.scene\n",
                "if ENGINE == 'CYCLES':\n",
                "    scene.render.engine = 'CYCLES'\n",
                "elif ENGINE == 'EEVEE':\n",
                "    # EEVEE's id changed across versions (BLENDER_EEVEE / BLENDER_EEVEE_NEXT)\n",
                "    for engine_id in ('BLENDER_EEVEE', 'BLENDER_EEVEE_NEXT'):\n",
                "        try:\n",
                "            scene.render.engine = engine_id\n",
                "            break\n",
                "        except TypeError:\n",
                "            pass\n",
                "\n",
                "# Resume: with overwrite off, Blender skips frames whose file already exists.\n",
                "# The render cell sets RENDERLIFT_SKIP_EXISTING from its SKIP_EXISTING checkbox.\n",
                "import os\n",
                "scene.render.use_overwrite = os.environ.get('RENDERLIFT_SKIP_EXISTING', '1') != '1'\n",
                "\n",
                "if SAMPLES > 0:\n",
                "    if hasattr(scene, 'cycles'):\n",
                "        scene.cycles.samples = SAMPLES\n",
                "    if hasattr(scene, 'eevee'):\n",
                "        scene.eevee.taa_render_samples = SAMPLES\n",
                "\n",
                "print(f'RenderLift: engine={scene.render.engine}')"
            ]
        },
        {
            cell_type: "code",
            execution_count: null,
            metadata: {},
            outputs: [],
            source: [
                `# 5. Run Render Command\n`,
                `import os, shlex\n`,
                `\n`,
                `# After a Colab disconnect, run the cells again: frames that are already in Renders/ are skipped.\n`,
                `# Untick this to render every frame again and overwrite the old ones.\n`,
                `SKIP_EXISTING = True  #@param {type:"boolean"}\n`,
                `\n`,
                `start_frame = ${startFrame}\n`,
                `end_frame = ${endFrame}\n`,
                `device = ${py(device)}\n`,
                `out_format = ${py(format)}\n`,
                `blender_dir = ${py(blenderDir)}\n`,
                `\n`,
                `output_dir = os.path.join(LIFT_DIR, 'Renders')\n`,
                `\n`,
                `# Re-renders move the previous output to Renders_<time> once, so old and new frames don't mix.\n`,
                `# Running this cell again in the same notebook (e.g. after a disconnect) keeps the frames.\n`,
                `RUN_ID = ${py(runId)}\n`,
                `ARCHIVE_PREVIOUS = ${archivePrevious ? 'True' : 'False'}\n`,
                `run_marker = os.path.join(output_dir, '.renderlift_run')\n`,
                `previous_run = open(run_marker).read().strip() if os.path.exists(run_marker) else None\n`,
                `if ARCHIVE_PREVIOUS and previous_run != RUN_ID and os.path.isdir(output_dir) and os.listdir(output_dir):\n`,
                `    import shutil, time\n`,
                `    archive_dir = f'{output_dir}_' + time.strftime('%Y%m%d_%H%M%S')\n`,
                `    shutil.move(output_dir, archive_dir)\n`,
                `    print(f'Previous output moved to {os.path.basename(archive_dir)}')\n`,
                `os.makedirs(output_dir, exist_ok=True)\n`,
                `with open(run_marker, 'w') as f:\n`,
                `    f.write(RUN_ID)\n`,
                `\n`,
                `# A frame cut off by a disconnect can be left empty; remove those so they get rendered again.\n`,
                `for name in os.listdir(output_dir):\n`,
                `    path = os.path.join(output_dir, name)\n`,
                `    if name.startswith('render_') and os.path.isfile(path) and os.path.getsize(path) == 0:\n`,
                `        os.remove(path)\n`,
                `\n`,
                `existing = [n for n in os.listdir(output_dir) if n.startswith('render_')]\n`,
                `if SKIP_EXISTING and existing:\n`,
                `    print(f'Resuming: {len(existing)} existing frame(s) in Renders/ will be skipped.')\n`,
                `os.environ['RENDERLIFT_SKIP_EXISTING'] = '1' if SKIP_EXISTING else '0'\n`,
                `\n`,
                `cmd = [\n`,
                `    f'./{blender_dir}/blender', '-b', blend_path, '-noaudio',\n`,
                `    '--python', '/content/renderlift_setup.py',\n`,
                `    '-o', f'{output_dir}/render_', '-F', out_format,\n`,
                `    '-s', str(start_frame), '-e', str(end_frame), '-a',\n`,
                `    '--', '--cycles-device', device,\n`,
                `]\n`,
                `cmd_line = shlex.join(cmd)\n`,
                `print(f'Executing: {cmd_line}')\n`,
                `!{cmd_line}`
            ]
        }
    ];

    // 6. Optional Video Stitching (only if multi-frame and requested)
    if (endFrame > startFrame && settings.generateVideo) {
        cells.push({
            cell_type: "markdown",
            metadata: {},
            source: [
                "## 6. (Optional) Generate Video\n",
                "This step is **optional**. It will combine your rendered frames into a single MP4 video file using FFmpeg."
            ]
        });

        const extension = format === 'JPEG' ? 'jpg' : format.toLowerCase();

        cells.push({
            cell_type: "code",
            execution_count: null,
            metadata: {},
            outputs: [],
            source: [
                `# Generate MP4 Video\n`,
                `import os\n`,
                `output_dir = os.path.join(${py(liftDir)}, 'Renders')\n`,
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
