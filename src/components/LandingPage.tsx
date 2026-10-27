"use client"

import { signIn } from "next-auth/react";
import { Activity } from "lucide-react";
import { Logo } from "./Logo";

export function LandingPage() {
    return (
        <main className="min-h-[calc(100-64px)] bg-background text-foreground selection:bg-accent selection:text-white">
            <div className="max-w-[1440px] mx-auto px-4 md:px-16 py-16">
                <div className="grid grid-cols-12 gap-8 items-start animate-in fade-in duration-700">
                    <div className="col-span-12 md:col-span-8 space-y-12">
                        <div className="flex items-center gap-4 text-[17px] font-bold tracking-tighter uppercase mb-12 md:mb-24">
                            <Logo className="w-8 h-8" />
                            <div>
                                <span className="text-orange-500">Render</span>
                                <span className="text-blue-500">Lift</span>
                                <span className="text-accent ml-2">/</span> 1.0
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight max-w-3xl">
                            Render Blender files using your Google Drive and Colab GPU.
                        </h1>
                        <div className="flex flex-col items-start gap-4">
                            <button
                                onClick={() => signIn("google")}
                                className="px-10 py-5 bg-accent text-white font-bold uppercase tracking-widest text-sm hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-3"
                            >
                                <Activity className="w-4 h-4" />
                                Initialize Operations_
                            </button>
                        </div>
                    </div>

                    {/* 3-step explanation */}
                    <div className="col-span-12 grid grid-cols-12 gap-8 mt-16 pt-16 border-t border-border-subtle">
                        {[
                            { id: "01", title: "Upload", desc: "Connect your Drive and upload your .blend project file directly to our secure storage." },
                            { id: "02", title: "Configure", desc: "Select your Blender version, frames, and quality. We generate a custom Python notebook." },
                            { id: "03", title: "Lift", desc: "Run the notebook in Google Colab to access high-end NVIDIA GPUs for free." }
                        ].map((step) => (
                            <div key={step.id} className="col-span-12 md:col-span-4 space-y-4">
                                <div className="text-4xl font-bold text-accent font-mono">{step.id}</div>
                                <h3 className="text-xl font-bold uppercase tracking-tight">{step.title}</h3>
                                <p className="text-foreground-muted leading-relaxed text-base">{step.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Developer Note */}
                    <div className="col-span-12 mt-16 p-8 bg-surface border border-border-subtle/50 space-y-4">
                        <div className="flex items-center gap-2 text-[13px] mono text-accent uppercase tracking-[0.2em] font-bold">
                            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                            Developer Note_
                        </div>
                        <p className="text-base text-foreground-muted leading-relaxed max-w-4xl font-mono">
                            RenderLift was built to solve the &quot;GPU bottleneck&quot; for independent artists. By bridging the gap between local project files and massive cloud compute nodes, we turn a standard Google account into a high-performance render farm. This project is in active development—focusing on extreme Swiss minimalism and pure technical efficiency.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
