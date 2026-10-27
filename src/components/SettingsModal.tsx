"use client"

import { useState, useEffect } from "react";
import { X, Save, RefreshCw } from "lucide-react";
import { getUserDefaults, saveUserDefaults } from "@/lib/userSettings";
import { RenderSettings, RenderEngine } from "@/components/RenderForm";
import { BLENDER_VERSIONS } from "@/lib/blenderVersions";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [settings, setSettings] = useState<RenderSettings>(getUserDefaults());
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = () => {
        setIsSaving(true);
        saveUserDefaults(settings);
        setTimeout(() => {
            setIsSaving(false);
            onClose();
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-xl bg-surface border border-border-subtle shadow-2xl p-8 space-y-8 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center border-b border-border-subtle pb-6">
                    <div className="space-y-1">
                        <div className="text-[10px] mono text-accent uppercase tracking-[0.2em] font-bold">Preferences</div>
                        <h2 className="text-2xl font-bold tracking-tight uppercase">Global Render Defaults</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-background transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Blender Version */}
                    <div className="space-y-4">
                        <label className="block text-[10px] mono font-bold uppercase tracking-widest opacity-60">Default Blender Version</label>
                        <select
                            value={settings.version}
                            onChange={(e) => setSettings({ ...settings, version: e.target.value })}
                            className="w-full px-4 py-3 bg-background border border-border-subtle focus:border-accent outline-none text-sm font-bold transition-colors appearance-none"
                        >
                            {BLENDER_VERSIONS.map(v => (
                                <option key={v.version} value={v.version}>{v.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Render Engine */}
                    <div className="space-y-4">
                        <label className="block text-[10px] mono font-bold uppercase tracking-widest opacity-60">Default Render Engine</label>
                        <select
                            value={settings.engine ?? 'SCENE'}
                            onChange={(e) => setSettings({ ...settings, engine: e.target.value as RenderEngine })}
                            className="w-full px-4 py-3 bg-background border border-border-subtle focus:border-accent outline-none text-sm font-bold transition-colors appearance-none"
                        >
                            <option value="SCENE">Scene default (as saved in .blend)</option>
                            <option value="CYCLES">Cycles</option>
                            <option value="EEVEE">EEVEE</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Format */}
                        <div className="space-y-4">
                            <label className="block text-[10px] mono font-bold uppercase tracking-widest opacity-60">Default Format</label>
                            <select
                                value={settings.format}
                                onChange={(e) => setSettings({ ...settings, format: e.target.value })}
                                className="w-full px-4 py-3 bg-background border border-border-subtle focus:border-accent outline-none text-sm font-bold transition-colors appearance-none"
                            >
                                <option value="PNG">PNG</option>
                                <option value="JPEG">JPEG</option>
                                <option value="OPEN_EXR">OpenEXR</option>
                            </select>
                        </div>
                        {/* Engine */}
                        <div className="space-y-4">
                            <label className="block text-[10px] mono font-bold uppercase tracking-widest opacity-60">Default Cycles Device</label>
                            <select
                                value={settings.device}
                                onChange={(e) => setSettings({ ...settings, device: e.target.value })}
                                className="w-full px-4 py-3 bg-background border border-border-subtle focus:border-accent outline-none text-sm font-bold transition-colors appearance-none"
                            >
                                <option value="CUDA">CUDA</option>
                                <option value="OPTIX">OptiX</option>
                                <option value="CPU">CPU</option>
                            </select>
                        </div>
                    </div>

                    {/* Quality */}
                    <div className="space-y-4">
                        <label className="block text-[10px] mono font-bold uppercase tracking-widest opacity-60">Global Samples</label>
                        <input
                            type="number"
                            min={1}
                            placeholder="Leave empty for project default"
                            value={settings.samples || ''}
                            onChange={(e) => setSettings({ ...settings, samples: e.target.value ? parseInt(e.target.value) : undefined })}
                            className="w-full px-4 py-3 bg-background border border-border-subtle focus:border-accent outline-none text-sm mono transition-colors"
                        />
                    </div>
                </div>

                <div className="pt-8 border-t border-border-subtle flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-[10px] mono font-bold uppercase tracking-widest hover:bg-background transition-colors"
                    >
                        CANCEL_
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-10 py-3 bg-accent text-white text-[10px] mono font-bold uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        SAVE_DEFAULTS
                    </button>
                </div>
            </div>
        </div>
    );
}
