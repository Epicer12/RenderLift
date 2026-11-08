import { useState } from "react";
import { Info, Box, Monitor, Calendar, Layers, Save } from 'lucide-react'
import clsx from 'clsx'
import { getUserDefaults, saveUserDefaults } from "@/lib/userSettings";
import { BLENDER_VERSIONS } from "@/lib/blenderVersions";

interface RenderFormProps {
    fileName: string | null
    onStartRender: (settings: RenderSettings) => void
    disabled: boolean
    // Start from these settings instead of the user's saved defaults (used when re-rendering a lift)
    initialSettings?: RenderSettings
}

// SCENE keeps whatever engine the .blend file was saved with
export type RenderEngine = 'SCENE' | 'CYCLES' | 'EEVEE'

// SCENE keeps whatever the .blend file has saved; ON / OFF force the setting
export type SceneToggle = 'SCENE' | 'ON' | 'OFF'

export interface RenderSettings {
    version: string
    startFrame: number
    endFrame: number
    format: string
    device: string
    engine?: RenderEngine
    generateVideo?: boolean
    samples?: number
    resolutionPercent?: number // 25 / 50 / 75 / 100 of the scene resolution; undefined keeps the saved size
    frameStep?: number // render every Nth frame (1 = every frame)
    denoise?: SceneToggle // Cycles only
    transparent?: SceneToggle // transparent background (PNG / OpenEXR)
}

export function RenderForm({ fileName, onStartRender, disabled, initialSettings }: RenderFormProps) {
    const [settings, setSettings] = useState<RenderSettings>(() => ({ ...getUserDefaults(), ...initialSettings }))

    const isRangeInvalid = settings.startFrame > settings.endFrame;
    const frameStep = Math.max(1, settings.frameStep ?? 1);
    const framesToRender = isRangeInvalid ? 0 : Math.floor((settings.endFrame - settings.startFrame) / frameStep) + 1;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isRangeInvalid) return;
        onStartRender(settings)
    }

    const handleSaveDefault = () => {
        saveUserDefaults(settings);
    }

    return (
        <div className="w-full space-y-12">
            <div className="p-6 bg-surface swiss-border space-y-4">
                <div className="flex items-start gap-4 text-accent">
                    <Info className="w-4 h-4 mt-1" />
                    <div className="space-y-1">
                        <div className="text-[13px] mono uppercase tracking-widest font-bold">Active Asset</div>
                        <div className="text-base font-bold truncate max-w-sm">{fileName || "No asset loaded"}</div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">

                {/* 01: Engine */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 text-foreground-muted">
                        <Box className="w-4 h-4" />
                        <span className="text-[13px] mono uppercase tracking-[0.2em] font-bold">01 / Environment</span>
                    </div>
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12">
                            <label className="block text-[15px] font-bold uppercase tracking-widest mb-3 opacity-60">Blender Version</label>
                            <select
                                value={settings.version}
                                onChange={(e) => setSettings({ ...settings, version: e.target.value })}
                                className="w-full px-4 py-3 bg-surface border border-border-subtle focus:border-accent outline-none text-base font-bold transition-colors appearance-none"
                                disabled={disabled}
                            >
                                {BLENDER_VERSIONS.map(v => (
                                    <option key={v.version} value={v.version}>{v.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-12">
                            <label className="block text-[15px] font-bold uppercase tracking-widest mb-3 opacity-60">Render Engine</label>
                            <select
                                value={settings.engine ?? 'SCENE'}
                                onChange={(e) => setSettings({ ...settings, engine: e.target.value as RenderEngine })}
                                className="w-full px-4 py-3 bg-surface border border-border-subtle focus:border-accent outline-none text-base font-bold transition-colors appearance-none"
                                disabled={disabled}
                            >
                                <option value="SCENE">Scene default (as saved in .blend)</option>
                                <option value="CYCLES">Cycles</option>
                                <option value="EEVEE">EEVEE</option>
                            </select>
                            {(settings.engine ?? 'SCENE') !== 'CYCLES' && (
                                <p className="mt-3 text-[12px] mono text-foreground-muted uppercase tracking-wider leading-relaxed">
                                    Scenes that use EEVEE render on a virtual display in Colab, which can be much slower than Cycles
                                    (one test frame took about 6 minutes).
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 02: Frame Range */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 text-foreground-muted">
                        <Calendar className="w-4 h-4" />
                        <span className="text-[13px] mono uppercase tracking-[0.2em] font-bold">02 / Frame Range</span>
                    </div>
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 sm:col-span-4">
                            <label className="block text-[15px] font-bold uppercase tracking-widest mb-3 opacity-60">Start_Frame</label>
                            <input
                                type="number"
                                min={1}
                                value={settings.startFrame}
                                onChange={(e) => setSettings({ ...settings, startFrame: parseInt(e.target.value) || 1 })}
                                className={clsx(
                                    "w-full px-4 py-3 bg-surface border outline-none text-base mono transition-colors",
                                    isRangeInvalid ? "border-red-500" : "border-border-subtle focus:border-accent"
                                )}
                                disabled={disabled}
                            />
                        </div>
                        <div className="col-span-12 sm:col-span-4">
                            <label className="block text-[15px] font-bold uppercase tracking-widest mb-3 opacity-60">End_Frame</label>
                            <input
                                type="number"
                                min={1}
                                value={settings.endFrame}
                                onChange={(e) => setSettings({ ...settings, endFrame: parseInt(e.target.value) || 1 })}
                                className={clsx(
                                    "w-full px-4 py-3 bg-surface border outline-none text-base mono transition-colors",
                                    isRangeInvalid ? "border-red-500" : "border-border-subtle focus:border-accent"
                                )}
                                disabled={disabled}
                            />
                        </div>
                        <div className="col-span-12 sm:col-span-4">
                            <label className="block text-[15px] font-bold uppercase tracking-widest mb-3 opacity-60">Every Nth frame</label>
                            <input
                                type="number"
                                min={1}
                                value={settings.frameStep ?? 1}
                                onChange={(e) => setSettings({ ...settings, frameStep: Math.max(1, parseInt(e.target.value) || 1) })}
                                className="w-full px-4 py-3 bg-surface border border-border-subtle focus:border-accent outline-none text-base mono transition-colors"
                                disabled={disabled}
                            />
                        </div>
                        {!isRangeInvalid && (
                            <div className="col-span-12 text-[12px] mono text-foreground-muted uppercase tracking-wider">
                                {framesToRender} {framesToRender === 1 ? 'frame' : 'frames'} will be rendered
                            </div>
                        )}
                        {isRangeInvalid && (
                            <div className="col-span-12 text-[13px] mono text-red-500 uppercase tracking-widest mt-2">
                                Start frame must not be after the end frame
                            </div>
                        )}
                        {settings.endFrame > settings.startFrame && (
                            <div className="col-span-12 mt-4 flex items-center gap-3 p-4 border border-border-subtle border-dashed">
                                <input
                                    type="checkbox"
                                    disabled={disabled}
                                    id="gen-video"
                                    checked={!!settings.generateVideo}
                                    onChange={(e) => setSettings({ ...settings, generateVideo: e.target.checked })}
                                    className="w-4 h-4 border-2 border-border-subtle bg-surface accent-accent rounded-none cursor-pointer"
                                />
                                <label htmlFor="gen-video" className="text-[13px] uppercase font-bold tracking-widest cursor-pointer opacity-80">
                                    Also make an MP4 video from the frames
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* 03: Output */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 text-foreground-muted">
                        <Monitor className="w-4 h-4" />
                        <span className="text-[13px] mono uppercase tracking-[0.2em] font-bold">03 / Output Format</span>
                    </div>
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 sm:col-span-6">
                            <label className="block text-[15px] font-bold uppercase tracking-widest mb-3 opacity-60">Format</label>
                            <select
                                value={settings.format}
                                onChange={(e) => setSettings({ ...settings, format: e.target.value })}
                                className="w-full px-4 py-3 bg-surface border border-border-subtle focus:border-accent outline-none text-base font-bold transition-colors appearance-none"
                                disabled={disabled}
                            >
                                <option value="PNG">PNG</option>
                                <option value="JPEG">JPEG</option>
                                <option value="OPEN_EXR">OpenEXR</option>
                            </select>
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                            <label className="block text-[15px] font-bold uppercase tracking-widest mb-3 opacity-60">Cycles Device</label>
                            <select
                                value={settings.device}
                                onChange={(e) => setSettings({ ...settings, device: e.target.value })}
                                className="w-full px-4 py-3 bg-surface border border-border-subtle focus:border-accent outline-none text-base font-bold transition-colors appearance-none"
                                disabled={disabled}
                            >
                                <option value="CUDA">CUDA</option>
                                <option value="OPTIX">OptiX</option>
                                <option value="CPU">CPU</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 04: Quality */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 text-foreground-muted">
                        <Layers className="w-4 h-4" />
                        <span className="text-[13px] mono uppercase tracking-[0.2em] font-bold">04 / Quality</span>
                    </div>
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12">
                            <label className="block text-[15px] font-bold uppercase tracking-widest mb-3 opacity-60">Samples</label>
                            <input
                                type="number"
                                min={1}
                                placeholder="Leave empty for project default"
                                value={settings.samples || ''}
                                onChange={(e) => setSettings({ ...settings, samples: e.target.value ? parseInt(e.target.value) : undefined })}
                                className="w-full px-4 py-3 bg-surface border border-border-subtle focus:border-accent outline-none text-base mono transition-colors"
                                disabled={disabled}
                            />
                        </div>
                        <div className="col-span-12 sm:col-span-4">
                            <label className="block text-[15px] font-bold uppercase tracking-widest mb-3 opacity-60">Image size</label>
                            <select
                                value={settings.resolutionPercent ?? 0}
                                onChange={(e) => setSettings({ ...settings, resolutionPercent: parseInt(e.target.value) || undefined })}
                                className="w-full px-4 py-3 bg-surface border border-border-subtle focus:border-accent outline-none text-base font-bold transition-colors appearance-none"
                                disabled={disabled}
                            >
                                <option value={0}>Scene default</option>
                                <option value={25}>25% (quick preview)</option>
                                <option value={50}>50%</option>
                                <option value={75}>75%</option>
                                <option value={100}>100% (full size)</option>
                            </select>
                        </div>
                        <div className="col-span-12 sm:col-span-4">
                            <label className="block text-[15px] font-bold uppercase tracking-widest mb-3 opacity-60">Denoise (Cycles)</label>
                            <select
                                value={settings.denoise ?? 'SCENE'}
                                onChange={(e) => setSettings({ ...settings, denoise: e.target.value as SceneToggle })}
                                className="w-full px-4 py-3 bg-surface border border-border-subtle focus:border-accent outline-none text-base font-bold transition-colors appearance-none"
                                disabled={disabled}
                            >
                                <option value="SCENE">Scene default</option>
                                <option value="ON">On</option>
                                <option value="OFF">Off</option>
                            </select>
                        </div>
                        <div className="col-span-12 sm:col-span-4">
                            <label className="block text-[15px] font-bold uppercase tracking-widest mb-3 opacity-60">Transparent background</label>
                            <select
                                value={settings.format === 'JPEG' ? 'SCENE' : settings.transparent ?? 'SCENE'}
                                onChange={(e) => setSettings({ ...settings, transparent: e.target.value as SceneToggle })}
                                className="w-full px-4 py-3 bg-surface border border-border-subtle focus:border-accent outline-none text-base font-bold transition-colors appearance-none disabled:opacity-40"
                                disabled={disabled || settings.format === 'JPEG'}
                            >
                                <option value="SCENE">Scene default</option>
                                <option value="ON">On</option>
                                <option value="OFF">Off</option>
                            </select>
                            {settings.format === 'JPEG' && (
                                <p className="mt-2 text-[12px] mono text-foreground-muted uppercase tracking-wider">Needs PNG or OpenEXR</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <button
                        type="submit"
                        disabled={disabled || !fileName || isRangeInvalid}
                        className={clsx(
                            "w-full md:w-auto px-10 py-5 bg-accent text-white font-bold uppercase tracking-widest text-base transition-all active:scale-95 shadow-[0_0_20px_rgba(79,140,255,0.1)]",
                            (disabled || !fileName || isRangeInvalid) && "opacity-20 cursor-not-allowed"
                        )}
                    >
                        Generate Render Lift
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveDefault}
                        className="w-full md:w-auto p-5 border border-border-subtle hover:border-accent hover:text-accent transition-all active:scale-95 group flex items-center justify-center"
                        title="Save settings as profile default"
                    >
                        <Save className="w-5 h-5" />
                    </button>
                </div>
                {!fileName && (
                    <div className="text-[13px] mono text-red-500 uppercase tracking-widest mt-4">
                        No source asset linked
                    </div>
                )}
            </form>
        </div>
    )
}
