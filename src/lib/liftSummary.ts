// What the dashboard shows for each lift. Everything here comes from the lift's
// render_config.json (written by this app). The app cannot see the files Colab renders
// into Drive (drive.file scope), so it never claims to know whether a render finished.

import type { RenderSettings } from "@/components/RenderForm";

const ENGINE_LABEL: Record<string, string> = {
    SCENE: "Scene engine",
    CYCLES: "Cycles",
    EEVEE: "EEVEE",
};

// e.g. "Frames 1-2 · Cycles · PNG · Blender 3.6.23 · video"
export function summarizeSettings(s: Partial<RenderSettings>): string {
    const parts: string[] = [];
    if (typeof s.startFrame === "number" && typeof s.endFrame === "number") {
        parts.push(s.startFrame === s.endFrame ? `Frame ${s.startFrame}` : `Frames ${s.startFrame}-${s.endFrame}`);
    }
    parts.push(ENGINE_LABEL[s.engine ?? "SCENE"] ?? "Scene engine");
    if (s.format) parts.push(s.format === "OPEN_EXR" ? "EXR" : s.format);
    if (s.version) parts.push(`Blender ${s.version}`);
    if (s.resolutionPercent) parts.push(`${s.resolutionPercent}% size`);
    if (s.frameStep && s.frameStep > 1) parts.push(`frame step ${s.frameStep}`);
    if (s.denoise === "ON" || s.denoise === "OFF") parts.push(`denoise ${s.denoise === "ON" ? "on" : "off"}`);
    if (s.format !== "JPEG" && (s.transparent === "ON" || s.transparent === "OFF")) {
        parts.push(`transparent bg ${s.transparent === "ON" ? "on" : "off"}`);
    }
    if (s.generateVideo) parts.push("video");
    return parts.join(" · ");
}

export function timeAgo(iso: string | null | undefined): string {
    if (!iso) return "";
    const t = Date.parse(iso);
    if (Number.isNaN(t)) return "";
    const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
}

export interface LiftSummary {
    settings: string;
    generatedAt: string | null;
}
