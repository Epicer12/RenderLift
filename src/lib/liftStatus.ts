// Render status for a lift, inferred from the files in its Renders/ folder.
// Colab can't report back to the app, so this is a best guess, not a fact.

export type LiftStatus = "not_started" | "rendering" | "done";

// A lift counts as "rendering" while its newest frame is younger than this.
export const RENDERING_WINDOW_MS = 15 * 60 * 1000;

export interface LiftStatusInput {
    frameCount: number;
    hasVideo: boolean;
    latestFrameTime: string | null; // ISO timestamp of the newest frame
    now?: number;
}

export function computeLiftStatus({ frameCount, hasVideo, latestFrameTime, now = Date.now() }: LiftStatusInput): LiftStatus {
    if (hasVideo) return "done";
    if (frameCount === 0) return "not_started";
    const t = latestFrameTime ? Date.parse(latestFrameTime) : NaN;
    if (Number.isNaN(t)) return "done";
    return now - t < RENDERING_WINDOW_MS ? "rendering" : "done";
}

export interface LiftInfo {
    status: LiftStatus;
    frameCount: number;
    hasVideo: boolean;
    latestFrameTime: string | null;
    thumbnailLink: string | null;
}
