"use client"

import { useState } from "react";
import Link from "next/link";
import { Folder, Play } from "lucide-react";
import { LoginButton } from "@/components/LoginButton";
import { Upload } from "@/components/Upload";
import { RenderForm, RenderSettings } from "@/components/RenderForm";

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<{ id: string, name: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [colabLink, setColabLink] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const handleUploadComplete = (file: { id: string, name: string }) => {
    setUploadedFile(file);
  };

  const handleStartRender = async (settings: RenderSettings) => {
    if (!uploadedFile) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/render/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadedFile.id,
          fileName: uploadedFile.name,
          settings: settings
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create job");

      setColabLink(data.notebookUrl);
      setActiveJobId(data.jobId);
    } catch (error) {
      console.error(error);
      alert("Failed to generate notebook. Check console.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              RenderLift
            </h1>
            <p className="text-gray-500 mt-1">Free Cloud Rendering for Blender</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/jobs"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <Folder className="w-4 h-4" />
              Manage Jobs
            </Link>
            <LoginButton />
          </div>
        </div>

        {/* Success / Monitoring State */}
        {colabLink && activeJobId ? (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto text-3xl">
                🚀
              </div>
              <h2 className="text-2xl font-bold text-green-800 dark:text-green-300">Ready to Render!</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
                Your notebook is ready. We'll take you directly to the <strong>Google Colab</strong> editor to start your GPU session.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <a
                  href={colabLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 transition-all active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Launch Cloud Notebook
                </a>
                <button
                  onClick={() => { setUploadedFile(null); setColabLink(null); setActiveJobId(null); }}
                  className="px-6 py-3 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  New Project
                </button>
              </div>
              <div className="pt-4 space-y-2">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 py-2 px-4 rounded-full inline-block">
                  STEP: Click "Runtime" → "Run All" once the editor loads.
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                  No extension required • Desktop only
                </p>
              </div>
            </div>

            {/* Final Output Display */}
            <div className="pt-8 border-t border-gray-200 dark:border-neutral-800">
              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500/5 blur-3xl rounded-full" />

                <div className="relative z-10 flex flex-col items-center text-center py-4">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                    <Folder className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                  </div>

                  <h2 className="text-2xl font-black tracking-tight mb-3">Access Your Renders</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-8 leading-relaxed">
                    Once the render starts in Colab, the output files will appear in your Drive folder automatically.
                  </p>

                  <a
                    href={`https://drive.google.com/drive/folders/${activeJobId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:scale-105 transition-all active:scale-95"
                  >
                    <Folder className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Open Render Folder
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Workflow */
          <div className="grid gap-12">

            {/* Step 1: Upload */}
            <div className={uploadedFile ? "opacity-50 pointer-events-none grayscale transition-all" : ""}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 text-sm">1</span>
                Upload .blend File
              </h2>
              <Upload onUploadComplete={handleUploadComplete} />
            </div>

            {/* Step 2: Configure */}
            {uploadedFile && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm">2</span>
                  Configure Job
                </h2>
                <RenderForm
                  fileName={uploadedFile.name}
                  onStartRender={handleStartRender}
                  disabled={isGenerating}
                />
                {isGenerating && (
                  <p className="text-center text-blue-500 mt-4 animate-pulse">Generating Notebook...</p>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
