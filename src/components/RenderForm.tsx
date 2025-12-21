"use client"

import { useState } from 'react'
import { Settings, Play, Info } from 'lucide-react'
import clsx from 'clsx'

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
    const [settings, setSettings] = useState<RenderSettings>({
        version: '4.2.0',
        startFrame: 1,
        endFrame: 1,
        format: 'PNG',
        device: 'CUDA',
        generateVideo: false
    })

    const isRangeInvalid = settings.startFrame > settings.endFrame;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isRangeInvalid) {
            alert("Start frame cannot be greater than end frame.");
            return;
        }
        onStartRender(settings)
    }

    return (
        <div className="w-full max-w-md mx-auto bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-gray-800 dark:text-gray-100">
                <Settings className="w-5 h-5" />
                <h2 className="font-semibold text-lg">Render Configuration</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* File Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md flex items-start gap-3 text-sm text-blue-700 dark:text-blue-300">
                    <Info className="w-5 h-5 shrink-0" />
                    <div>
                        <p className="font-medium">Selected File:</p>
                        <p className="truncate opacity-80">{fileName || "No file selected"}</p>
                    </div>
                </div>

                {/* Blender Version */}
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Blender Version</label>
                    <select
                        value={settings.version}
                        onChange={(e) => setSettings({ ...settings, version: e.target.value })}
                        className="w-full p-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent dark:text-white"
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

                {/* Frame Range */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Start Frame</label>
                        <input
                            type="number"
                            min={1}
                            value={settings.startFrame}
                            onChange={(e) => setSettings({ ...settings, startFrame: parseInt(e.target.value) || 1 })}
                            className={clsx(
                                "w-full p-2 rounded-md border bg-transparent dark:text-white outline-none transition-colors",
                                isRangeInvalid ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-gray-300 dark:border-neutral-700"
                            )}
                            disabled={disabled}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">End Frame</label>
                        <input
                            type="number"
                            min={1}
                            value={settings.endFrame}
                            onChange={(e) => setSettings({ ...settings, endFrame: parseInt(e.target.value) || 1 })}
                            className={clsx(
                                "w-full p-2 rounded-md border bg-transparent dark:text-white outline-none transition-colors",
                                isRangeInvalid ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-gray-300 dark:border-neutral-700"
                            )}
                            disabled={disabled}
                        />
                    </div>
                </div>
                {isRangeInvalid && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                        Start frame must be less than or equal to End frame
                    </p>
                )}

                {/* Optional Video Creation (Only if multi-frame) */}
                {settings.endFrame > settings.startFrame && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-md border border-blue-100 dark:border-blue-900/30">
                        <input
                            type="checkbox"
                            disabled={disabled}
                            id="gen-video"
                            checked={!!settings.generateVideo}
                            onChange={(e) => setSettings({ ...settings, generateVideo: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="gen-video" className="text-sm dark:text-gray-300 cursor-pointer">
                            Include <strong>Video Generation</strong> cell in notebook (Optional)
                        </label>
                    </div>
                )}

                {/* Format, Device & Samples */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Format</label>
                        <select
                            value={settings.format}
                            onChange={(e) => setSettings({ ...settings, format: e.target.value })}
                            className="w-full p-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent dark:text-white"
                            disabled={disabled}
                        >
                            <option value="PNG">PNG</option>
                            <option value="JPEG">JPEG</option>
                            <option value="OPEN_EXR">OpenEXR</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Device</label>
                        <select
                            value={settings.device}
                            onChange={(e) => setSettings({ ...settings, device: e.target.value })}
                            className="w-full p-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent dark:text-white"
                            disabled={disabled}
                        >
                            <option value="CUDA">CUDA</option>
                            <option value="OPTIX">OptiX</option>
                            <option value="CPU">CPU</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                        Samples <span className="text-xs font-normal opacity-60">(Optional - overrides file settings)</span>
                    </label>
                    <input
                        type="number"
                        min={1}
                        placeholder="e.g. 128 (Leave empty for file default)"
                        value={settings.samples || ''}
                        onChange={(e) => setSettings({ ...settings, samples: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full p-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent dark:text-white outline-none focus:border-blue-500 transition-colors"
                        disabled={disabled}
                    />
                </div>

                <button
                    type="submit"
                    disabled={disabled || !fileName || isRangeInvalid}
                    className={clsx(
                        "w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all mt-4",
                        disabled || !fileName || isRangeInvalid
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-600"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                    )}
                >
                    <Play className="w-5 h-5 fill-current" />
                    Generate Colab Notebook
                </button>
            </form>
        </div>
    )
}
