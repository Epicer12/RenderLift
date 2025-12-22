import { RenderSettings } from "@/components/RenderForm";

const SETTINGS_KEY = 'renderlift_user_defaults';

export const DEFAULT_RENDER_SETTINGS: RenderSettings = {
    version: '4.2.0',
    startFrame: 1,
    endFrame: 1,
    format: 'PNG',
    device: 'CUDA',
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
        return { ...DEFAULT_RENDER_SETTINGS, ...JSON.parse(saved) };
    } catch {
        return DEFAULT_RENDER_SETTINGS;
    }
}
