import { useState, useEffect } from "react";
import { Settings, Play, Info, Box, Monitor, Calendar, Layers, Save } from 'lucide-react'
import clsx from 'clsx'
import { getUserDefaults, saveUserDefaults } from "@/lib/userSettings";

interface RenderFormProps {
    fileName: string | null
    onStartRender: (settings: RenderSettings) => void
    disabled: boolean
}

export interface RenderSettings {
    version: string
    startFrame: number
    endFrame: number
    format: string
    device: string
    generateVideo?: boolean
    samples?: number
}

export function RenderForm({ fileName, onStartRender, disabled }: RenderFormProps) {
    const [settings, setSettings] = useState<RenderSettings>(getUserDefaults())

    const isRangeInvalid = settings.startFrame > settings.endFrame;

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
                                <option value="2.83.20">2.83.20 (LTS)</option>
                                <option value="2.93.18">2.93.18 (LTS)</option>
                                <option value="3.3.15">3.3.15 (LTS)</option>
                                <option value="3.6.13">3.6.13 (LTS)</option>
                                <option value="4.0.2">4.0.2</option>
                                <option value="4.1.1">4.1.1</option>
                                <option value="4.2.0">4.2.0 (LTS)</option>
                                <option value="4.3.0">4.3.0</option>
                                <option value="4.5.3">4.5.3 (Alpha)</option>
                            </select>
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
                        <div className="col-span-6">
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
                        <div className="col-span-6">
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
                        {isRangeInvalid && (
                            <div className="col-span-12 text-[13px] mono text-red-500 uppercase tracking-widest mt-2">
                                Critical Error: Start frame &gt; End frame
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
                                    Include Video_Merge Node
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
                        <div className="col-span-6">
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
                        <div className="col-span-6">
                            <label className="block text-[15px] font-bold uppercase tracking-widest mb-3 opacity-60">Engine</label>
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
                        <span className="text-[13px] mono uppercase tracking-[0.2em] font-bold">04 / Global Samples</span>
                    </div>
                    <div>
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
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        type="submit"
                        disabled={disabled || !fileName || isRangeInvalid}
                        className={clsx(
                            "px-10 py-5 bg-accent text-white font-bold uppercase tracking-widest text-base transition-all active:scale-95 shadow-[0_0_20px_rgba(79,140,255,0.1)]",
                            (disabled || !fileName || isRangeInvalid) && "opacity-20 cursor-not-allowed"
                        )}
                    >
                        Generate Render Lift
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveDefault}
                        className="p-5 border border-border-subtle hover:border-accent hover:text-accent transition-all active:scale-95 group"
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
