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
}

export function RenderForm({ fileName, onStartRender, disabled }: RenderFormProps) {
    const [settings, setSettings] = useState<RenderSettings>({
        version: '3.6.2',
        startFrame: 1,
        endFrame: 1,
        format: 'PNG',
        device: 'CUDA'
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
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
                        <option value="3.6.2">3.6.2 (LTS)</option>
                        <option value="4.2.0">4.2.0 (LTS)</option>
                        <option value="4.5.3">4.5.3 (Alpha)</option>
                    </select>
                </div>

                {/* Frame Range */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Start Frame</label>
                        <input
                            type="number"
                            value={settings.startFrame}
                            onChange={(e) => setSettings({ ...settings, startFrame: parseInt(e.target.value) })}
                            className="w-full p-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent dark:text-white"
                            disabled={disabled}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">End Frame</label>
                        <input
                            type="number"
                            value={settings.endFrame}
                            onChange={(e) => setSettings({ ...settings, endFrame: parseInt(e.target.value) })}
                            className="w-full p-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent dark:text-white"
                            disabled={disabled}
                        />
                    </div>
                </div>

                {/* Format & Device */}
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

                <button
                    type="submit"
                    disabled={disabled || !fileName}
                    className={clsx(
                        "w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all mt-4",
                        disabled || !fileName
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
