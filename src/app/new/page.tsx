"use client"

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Folder, Play, Info, Loader2, ChevronLeft } from "lucide-react";
import { Upload } from "@/components/Upload";
import { RenderForm, RenderSettings } from "@/components/RenderForm";
import { useSession } from "next-auth/react";
import { trackNotebookGenerated, trackNotebookOpened } from "@/lib/analytics";

// useSearchParams needs a Suspense boundary for the page to build
export default function NewLiftPage() {
    return (
        <Suspense fallback={null}>
            <NewLiftContent />
        </Suspense>
    );
}

function NewLiftContent() {
    const { data: session } = useSession();
    // /new?lift=<id> re-renders an existing lift: no upload, settings start from its last run
    const liftParam = useSearchParams().get("lift");
    const [uploadedFile, setUploadedFile] = useState<{ id: string, name: string } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [colabLink, setColabLink] = useState<string | null>(null);
    const [activeLiftId, setActiveLiftId] = useState<string | null>(null);
    const [rerenderConfig, setRerenderConfig] = useState<{ fileName: string, settings: RenderSettings } | null>(null);
    const [configError, setConfigError] = useState(false);

    useEffect(() => {
        if (!liftParam || !session) return;
        let cancelled = false;
        fetch(`/api/lifts/${encodeURIComponent(liftParam)}/config`)
            .then(async (res) => {
                if (!res.ok) throw new Error("No saved settings");
                const d = await res.json();
                if (!cancelled) setRerenderConfig({ fileName: d.fileName, settings: d.settings });
            })
            .catch(() => { if (!cancelled) setConfigError(true); });
        return () => { cancelled = true; };
    }, [liftParam, session]);

    // The file being rendered: the one just uploaded, or the lift's original file when re-rendering
    const formFileName = liftParam ? rerenderConfig?.fileName ?? null : uploadedFile?.name ?? null;

    if (!session) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                <div className="text-accent mono text-[15px] uppercase tracking-widest font-bold">Sign in required</div>
                <h1 className="text-3xl font-bold tracking-tight">Sign in with Google to continue</h1>
                <Link href="/" className="px-8 py-4 bg-accent text-white font-bold uppercase tracking-widest text-xs active:scale-95 transition-all">
                    Back to home
                </Link>
            </div>
        );
    }

    const handleUploadComplete = (file: { id: string, name: string }) => {
        setUploadedFile(file);
    };

    const handleStartRender = async (settings: RenderSettings) => {
        if (!liftParam && !uploadedFile) return;

        setIsGenerating(true);
        try {
            const res = await fetch("/api/render/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    liftParam
                        ? { liftId: liftParam, settings }
                        : { fileId: uploadedFile!.id, fileName: uploadedFile!.name, settings }
                )
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create lift");

            trackNotebookGenerated({ rerender: !!liftParam, engine: settings.engine, device: settings.device });
            setColabLink(data.notebookUrl);
            setActiveLiftId(data.liftId);
        } catch (error) {
            console.error(error);
            alert("Failed to generate notebook.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <main className="min-h-screen">
            <div className="max-w-[1440px] mx-auto px-4 md:px-16 py-12 md:py-24">

                {colabLink && activeLiftId ? (
                    /* Success Screen */
                    <div className="grid grid-cols-12 gap-8 animate-in slide-in-from-bottom-8 duration-500">
                        <div className="col-span-12 md:col-span-7 space-y-12">
                            <div className="space-y-4">
                                <div className="text-[13px] mono text-accent uppercase tracking-[0.2em] font-bold">Notebook ready</div>
                                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Render_Lift.ipynb</h2>
                            </div>
                            <div className="space-y-6 border-l-2 border-border-subtle pl-8">
                                {[
                                    { label: "Saved to", status: "Google Drive", detail: "RenderLift/Lifts" },
                                    { label: "Next step", status: "Open the notebook in Colab", detail: "Run all cells" }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-end border-b border-border-subtle/50 pb-2">
                                        <div className="space-y-1">
                                            <div className="text-[13px] mono text-foreground-muted uppercase tracking-widest">{item.label}</div>
                                            <div className="font-bold">{item.status}</div>
                                        </div>
                                        <div className="text-[15px] mono text-foreground-muted uppercase">{item.detail}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col md:flex-row gap-4 pt-8">
                                <a
                                    href={colabLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={trackNotebookOpened}
                                    className="px-10 py-5 bg-accent text-white font-bold uppercase tracking-widest text-sm hover:bg-blue-600 transition-all active:scale-95 shadow-[0_0_30px_rgba(79,140,255,0.2)] flex items-center justify-center md:justify-start gap-4 text-center"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    Open Live Notebook
                                </a>
                                <a
                                    href={`https://drive.google.com/drive/folders/${activeLiftId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-10 py-5 bg-surface swiss-border text-foreground font-bold uppercase tracking-widest text-sm hover:border-foreground transition-all active:scale-95 flex items-center justify-center md:justify-start gap-4 text-center"
                                >
                                    <Folder className="w-5 h-5" />
                                    View Drive Output
                                </a>
                            </div>
                            <div className="pt-8">
                                <Link
                                    href="/"
                                    className="text-[15px] font-bold uppercase tracking-widest text-foreground-muted hover:text-foreground transition-colors"
                                >
                                    Return to Dashboard_
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Creation Workflow */
                    <div className="space-y-16">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="p-2 border border-border-subtle hover:border-foreground transition-all group">
                                <ChevronLeft className="w-4 h-4 text-foreground-muted group-hover:text-foreground" />
                            </Link>
                            <div className="space-y-1">
                                <div className="text-[13px] mono text-accent uppercase tracking-[0.2em] font-bold">{liftParam ? "Existing render" : "New render"}</div>
                                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{liftParam ? "Re-render" : "Upload your file"}</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-8 md:gap-16 animate-in slide-in-from-bottom-12 duration-700">
                            <div className="col-span-12 md:col-span-8">
                                {!formFileName && liftParam ? (
                                    configError ? (
                                        <div className="p-6 bg-surface border-l-2 border-red-500/60 space-y-3">
                                            <p className="text-[13px] mono text-foreground-muted leading-relaxed uppercase tracking-widest">
                                                This lift has no saved render settings, so it can&apos;t be re-rendered. Start a new render instead.
                                            </p>
                                            <Link href="/new" className="text-[13px] mono text-accent font-bold hover:underline uppercase tracking-widest">New render</Link>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 mono text-[15px] text-accent animate-pulse">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Loading your last render settings...
                                        </div>
                                    )
                                ) : !formFileName ? (
                                    <div className="space-y-12">
                                        <Upload onUploadComplete={handleUploadComplete} />
                                        <div className="flex items-start gap-4 p-6 bg-surface border-l-2 border-accent/20">
                                            <Info className="w-4 h-4 mt-1 text-accent" />
                                            <p className="text-[13px] mono text-foreground-muted leading-relaxed uppercase tracking-widest">
                                                Warning: Large scene assets take time to sync. Ensure all linked textures are packed within the .blend file (File &gt; External Data &gt; Pack Resources), or upload the project folder as a .zip.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-12">
                                        <RenderForm
                                            fileName={formFileName}
                                            onStartRender={handleStartRender}
                                            disabled={isGenerating}
                                            initialSettings={rerenderConfig?.settings}
                                        />
                                        {liftParam && (
                                            <p className="text-[13px] mono text-foreground-muted leading-relaxed uppercase tracking-widest">
                                                Your current notebook in this lift is replaced. When you run it, the previous output moves to a Renders_&lt;date&gt; folder.
                                            </p>
                                        )}
                                        {isGenerating && (
                                            <div className="flex items-center gap-4 mono text-[15px] text-accent bg-accent/5 p-6 animate-pulse">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Creating your notebook in Google Drive...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="col-span-12 md:col-span-4 self-start sticky top-24">
                                <div className="bg-surface swiss-border p-8 space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[13px] mono text-foreground-muted uppercase tracking-widest">Runs on</label>
                                        <div className="text-base font-bold uppercase">Google Colab</div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] mono text-foreground-muted uppercase tracking-widest">GPU</label>
                                        <div className="text-base font-bold">Free Colab GPU, assigned by Google</div>
                                    </div>
                                    <div className="pt-8 border-t border-border-subtle">
                                        <div className="text-[12px] mono text-foreground-muted uppercase leading-relaxed">
                                            How it works: upload your file, choose your settings, and click &quot;Generate&quot;. You get a link to open the notebook in Google Colab and run the render there.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}
