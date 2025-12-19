"use client"

import { useState } from "react";
import { LoginButton } from "@/components/LoginButton";
import { Upload } from "@/components/Upload";
import { RenderForm, RenderSettings } from "@/components/RenderForm";

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<{ id: string, name: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [colabLink, setColabLink] = useState<string | null>(null);

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
    } catch (error) {
      console.error(error);
      alert("Failed to generate notebook. Check console.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              RenderLift
            </h1>
            <p className="text-gray-500 mt-1">Free Cloud Rendering for Blender</p>
          </div>
          <LoginButton />
        </div>

        {/* Success / Colab Link State */}
        {colabLink ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto text-3xl">
              🚀
            </div>
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-300">Ready to Render!</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your secure notebook has been generated and uploaded back to your Drive.
            </p>
            <a
              href={colabLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Google Colab Notebook
            </a>
            <p className="text-sm text-gray-500 pt-4">
              (Click "Runtime" -&gt; "Run All" once you are in Colab)
            </p>
            <button
              onClick={() => { setUploadedFile(null); setColabLink(null); }}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline mt-2"
            >
              Start New Render
            </button>
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
