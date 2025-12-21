"use client"

import { useState, useEffect } from "react";
import { Folder, Trash2, Edit2, ChevronLeft, Loader2, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { LoginButton } from "@/components/LoginButton";

interface Job {
    id: string;
    name: string;
    createdTime: string;
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [newName, setNewName] = useState("");

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/jobs");
            const data = await res.json();
            if (data.jobs) {
                setJobs(data.jobs);
            }
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (jobId: string) => {
        if (!confirm("Are you sure you want to delete this job folder? This cannot be undone.")) return;

        try {
            const res = await fetch("/api/jobs", {
                method: "DELETE",
                body: JSON.stringify({ jobId }),
            });
            if (res.ok) {
                setJobs(jobs.filter(j => j.id !== jobId));
            }
        } catch (error) {
            console.error("Failed to delete job", error);
        }
    };

    const handleRename = async (jobId: string) => {
        if (!newName.trim()) return;

        try {
            const res = await fetch("/api/jobs", {
                method: "PATCH",
                body: JSON.stringify({ jobId, newName }),
            });
            if (res.ok) {
                setJobs(jobs.map(j => j.id === jobId ? { ...j, name: newName } : j));
                setRenamingId(null);
                setNewName("");
            }
        } catch (error) {
            console.error("Failed to rename job", error);
        }
    };

    return (
        <main className="min-h-screen p-8 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-full transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                Render Jobs
                            </h1>
                            <p className="text-gray-500 mt-1">Manage your blender renders</p>
                        </div>
                    </div>
                    <LoginButton />
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                        <p className="text-gray-500">Loading your jobs from Google Drive...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-xl border border-dashed border-gray-300 dark:border-neutral-800">
                        <Folder className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium">No jobs found</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mt-2">
                            Upload a <code>.blend</code> file to get started with your first render job.
                        </p>
                        <Link href="/" className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Create New Job
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {jobs.map((job) => (
                            <div key={job.id} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-shadow hover:shadow-md">
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    <Link href={`/jobs/${job.id}`} className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0 hover:bg-blue-100 transition-colors">
                                        <Folder className="w-6 h-6" />
                                    </Link>
                                    <div className="min-w-0 flex-1">
                                        {renamingId === job.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={newName}
                                                    autoFocus
                                                    onChange={(e) => setNewName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleRename(job.id)}
                                                    className="p-1 px-2 rounded border border-blue-500 bg-transparent outline-none text-lg font-semibold w-full"
                                                />
                                                <button onClick={() => handleRename(job.id)} className="text-green-500 hover:text-green-600 font-medium shrink-0">Save</button>
                                                <button onClick={() => setRenamingId(null)} className="text-gray-500 hover:text-gray-600 shrink-0">Cancel</button>
                                            </div>
                                        ) : (
                                            <h3 className="text-lg font-semibold truncate flex items-center gap-2 group/title">
                                                <Link href={`/jobs/${job.id}`} className="hover:text-blue-600 transition-colors truncate">
                                                    {job.name}
                                                </Link>
                                                <button
                                                    onClick={() => { setRenamingId(job.id); setNewName(job.name); }}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </h3>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(job.createdTime).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{new Date(job.createdTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link
                                        href={`/jobs/${job.id}`}
                                        className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                                    >
                                        View Output
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(job.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        <span className="md:hidden">Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Permission Note */}
                {!loading && jobs.length > 0 && (
                    <div className="mt-12 p-6 bg-blue-50/30 dark:bg-blue-500/5 rounded-2xl border border-blue-100/50 dark:border-blue-500/10 flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">A Note on Permissions</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                RenderLift uses strict <strong>drive.file</strong> permissions for your privacy. This means the app can only delete folders it fully created. If a folder contains renders from Colab, you may need to delete it manually in your <a href="https://drive.google.com/drive/folders/" target="_blank" className="text-blue-600 hover:underline">Google Drive</a>.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
