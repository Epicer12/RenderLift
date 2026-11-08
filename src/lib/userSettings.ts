import { RenderSettings } from "@/components/RenderForm";
import { DEFAULT_BLENDER_VERSION, resolveBlenderVersion } from "@/lib/blenderVersions";

const SETTINGS_KEY = 'renderlift_user_defaults';

export const DEFAULT_RENDER_SETTINGS: RenderSettings = {
    version: DEFAULT_BLENDER_VERSION,
    startFrame: 1,
    endFrame: 1,
    format: 'PNG',
    device: 'CUDA',
    engine: 'SCENE',
    generateVideo: false,
};

export function saveUserDefaults(settings: RenderSettings) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getUserDefaults(): RenderSettings {
    if (typeof window === 'undefined') return DEFAULT_RENDER_SETTINGS;
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return DEFAULT_RENDER_SETTINGS;
    try {
        const merged = { ...DEFAULT_RENDER_SETTINGS, ...JSON.parse(saved) };
        // Defaults saved before a version was retired still point at a usable build
        return { ...merged, version: resolveBlenderVersion(merged.version) };
    } catch {
        return DEFAULT_RENDER_SETTINGS;
    }
}
