"use client"

import { ExternalLink, Folder } from "lucide-react";

interface JobMonitorProps {
    jobId: string;
}

export function JobMonitor({ jobId }: JobMonitorProps) {
    const jobFolderUrl = `https://drive.google.com/drive/folders/${jobId}`;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-8 shadow-2xl relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500/5 blur-3xl rounded-full" />

                <div className="relative z-10 flex flex-col items-center text-center py-4">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center mb-6">
                        <Folder className="w-10 h-10 text-blue-600 dark:text-blue-500" />
                    </div>

                    <h2 className="text-3xl font-black tracking-tight mb-3">View Your Render</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-base max-w-sm mb-8 leading-relaxed">
                        Your project and its renders are stored in a dedicated folder on your Google Drive.
                    </p>

                    <a
                        href={jobFolderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 transition-all active:scale-95"
                    >
                        <ExternalLink className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        Open Job Folder
                    </a>

                    <p className="mt-6 text-xs text-gray-400 font-medium">
                        Look for the <span className="text-blue-500 font-bold">Renders</span> folder inside to find your final images or video.
                    </p>
                </div>
            </div>
        </div>
    );
}
