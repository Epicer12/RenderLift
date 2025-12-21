"use client"

import { useState, useEffect, useCallback } from "react";
import {
    ChevronLeft,
    Loader2,
    Calendar,
    Image as ImageIcon,
    RefreshCw,
    Play,
    Clock,
    CheckCircle2,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LoginButton } from "@/components/LoginButton";

interface JobDetail {
    jobId: string;
    name: string;
    createdTime: string;
    config: {
        fileName: string;
        settings: {
            startFrame: number;
            endFrame: number;
            format: string;
            version: string;
        };
    } | null;
    progress: {
        count: number;
        latestFrame: {
            id: string;
            name: string;
            webViewLink: string;
            thumbnailLink: string;
        } | null;
    };
}

export default function JobDetailPage() {
    const params = useParams();
    const jobId = params.jobId as string;

    const [job, setJob] = useState<JobDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPolling, setIsPolling] = useState(false);

    const fetchJobDetail = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const res = await fetch(`/api/jobs/${jobId}`);
            if (!res.ok) throw new Error("Failed to fetch job");
            const data = await res.json();
            setJob(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        fetchJobDetail();
    }, [fetchJobDetail]);

    // Polling logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPolling) {
            interval = setInterval(() => {
                fetchJobDetail(false);
            }, 15000); // Poll every 15 seconds
        }
        return () => clearInterval(interval);
    }, [isPolling, fetchJobDetail]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="mt-4 text-gray-500">Connecting to Google Drive...</p>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black">
                <h1 className="text-2xl font-bold">Job Not Found</h1>
                <Link href="/jobs" className="mt-4 text-blue-600 hover:underline">Back to Jobs</Link>
            </div>
        );
    }

    const totalFrames = job.config ? (job.config.settings.endFrame - job.config.settings.startFrame + 1) : 1;
    const currentProgress = (job.progress.count / totalFrames) * 100;
    const isFinished = job.progress.count >= totalFrames;

    return (
        <main className="min-h-screen p-8 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/jobs" className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-full transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold truncate max-w-[300px] md:max-w-md">
                                {job.name}
                            </h1>
                            <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                <Calendar className="w-4 h-4" />
                                <span>Created {new Date(job.createdTime).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsPolling(!isPolling)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isPolling
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 ring-2 ring-blue-500/20"
                                    : "bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50"
                                }`}
                        >
                            <RefreshCw className={`w-4 h-4 ${isPolling ? "animate-spin" : ""}`} />
                            {isPolling ? "Auto Polling On" : "Auto Polling Off"}
                        </button>
                        <LoginButton />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Progress & Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Progress Card */}
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-8 shadow-sm overflow-hidden relative">
                            {isFinished && (
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="flex items-center gap-1 text-green-500 font-semibold text-sm bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Complete
                                    </div>
                                </div>
                            )}

                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <Play className="w-5 h-5 text-blue-600" />
                                Render Progress
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm font-medium mb-2">
                                    <span className="text-gray-500">Frames Rendered</span>
                                    <span>{job.progress.count} / {totalFrames}</span>
                                </div>
                                <div className="w-full h-4 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min(currentProgress, 100)}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    {isFinished
                                        ? "All frames have been successfully rendered."
                                        : `Rendering... ${Math.round(currentProgress)}% complete.`}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-10 border-t border-gray-100 dark:border-neutral-800">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Format</p>
                                    <p className="font-medium">{job.config?.settings.format || "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Blender</p>
                                    <p className="font-medium">v{job.config?.settings.version || "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Start Frame</p>
                                    <p className="font-medium">{job.config?.settings.startFrame || "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">End Frame</p>
                                    <p className="font-medium">{job.config?.settings.endFrame || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/20 flex gap-4">
                            <Clock className="w-6 h-6 text-blue-600 shrink-0" />
                            <div>
                                <h4 className="font-semibold text-blue-900 dark:text-blue-300">Auto-Update Information</h4>
                                <p className="text-sm text-blue-700/80 dark:text-blue-400/80 mt-1">
                                    This dashboard polls Google Drive every 15 seconds to check for new frames.
                                    You don't need to refresh the page to see progress.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Latest Render Preview */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm overflow-hidden">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-indigo-600" />
                                Latest Output
                            </h3>

                            <div className="aspect-square rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 overflow-hidden flex items-center justify-center relative group">
                                {job.progress.latestFrame ? (
                                    <>
                                        {/* Using thumbnailLink, but in a real app you might want to proxy the full image */}
                                        <img
                                            src={job.progress.latestFrame.thumbnailLink.replace('=s220', '=s800')}
                                            alt="Latest Render"
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <a
                                                href={job.progress.latestFrame.webViewLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-white text-black px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                View Original
                                            </a>
                                        </div>
                                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs">
                                            {job.progress.latestFrame.name}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-6 space-y-2">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-300" />
                                        <p className="text-sm text-gray-500">Waiting for first frame...</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 space-y-3">
                                <a
                                    href={`https://drive.google.com/drive/search?q='${jobId}'`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    Open Folder in Drive
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
