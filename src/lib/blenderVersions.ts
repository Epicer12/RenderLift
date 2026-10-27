// Single source of truth for the Blender builds a lift can use.
// Each entry is the latest point release of its line on download.blender.org.
export interface BlenderVersion {
    version: string;
    label: string;
}

export const BLENDER_VERSIONS: BlenderVersion[] = [
    { version: '2.83.20', label: '2.83.20 (LTS)' },
    { version: '2.93.18', label: '2.93.18 (LTS)' },
    { version: '3.3.21', label: '3.3.21 (LTS)' },
    { version: '3.6.23', label: '3.6.23 (LTS)' },
    { version: '4.0.2', label: '4.0.2' },
    { version: '4.1.1', label: '4.1.1' },
    { version: '4.2.23', label: '4.2.23 (LTS)' },
    { version: '4.3.2', label: '4.3.2' },
    { version: '4.5.15', label: '4.5.15 (LTS)' },
    { version: '5.0.1', label: '5.0.1' },
    { version: '5.1.2', label: '5.1.2' },
    { version: '5.2.3', label: '5.2.3' },
];

export const DEFAULT_BLENDER_VERSION = '4.2.23';

const series = (version: string) => version.split('.').slice(0, 2).join('.');

// Maps any saved or requested version (e.g. an old "4.2.0" default) to a supported build:
// same version if listed, otherwise the latest build of the same line, otherwise the default.
export function resolveBlenderVersion(version: string | undefined): string {
    if (!version) return DEFAULT_BLENDER_VERSION;
    if (BLENDER_VERSIONS.some(v => v.version === version)) return version;
    const sameSeries = BLENDER_VERSIONS.find(v => series(v.version) === series(version));
    return sameSeries ? sameSeries.version : DEFAULT_BLENDER_VERSION;
}

export function blenderDownloadUrl(version: string): string {
    const resolved = resolveBlenderVersion(version);
    return `https://download.blender.org/release/Blender${series(resolved)}/blender-${resolved}-linux-x64.tar.xz`;
}
