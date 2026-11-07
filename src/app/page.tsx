"use client"

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Trash2, Edit2, Loader2, Activity, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { LandingPage } from "@/components/LandingPage";
import { WhatsNew } from "@/components/WhatsNew";
import { timeAgo, type LiftSummary } from "@/lib/liftSummary";

interface Lift {
  id: string;
  name: string;
  createdTime: string;
}

export default function Home() {
  const { data: session } = useSession();

  // Dashboard Stats & List
  const [lifts, setLifts] = useState<Lift[]>([]);
  const [loadingLifts, setLoadingLifts] = useState(false);
  // True once the lift list has loaded successfully (a failed load must not look like "no lifts")
  const [liftsLoaded, setLiftsLoaded] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  // Per-lift settings summary, filled in after the list loads. Missing = still loading or unavailable.
  const [summaries, setSummaries] = useState<Record<string, LiftSummary>>({});

  const fetchSummary = useCallback(async (liftId: string) => {
    try {
      const res = await fetch(`/api/lifts/${liftId}/config`);
      if (!res.ok) return;
      const d = await res.json();
      setSummaries(prev => ({ ...prev, [liftId]: { settings: d.summary ?? "", generatedAt: d.createdAt ?? null } }));
    } catch {
      // The summary is optional; the row still works without it.
    }
  }, []);

  // A few at a time so a long list doesn't fire dozens of Drive requests at once.
  const fetchSummaries = useCallback(async (ids: string[]) => {
    const queue = [...ids];
    const worker = async () => {
      for (let id = queue.shift(); id; id = queue.shift()) await fetchSummary(id);
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
  }, [fetchSummary]);

  const fetchLifts = useCallback(async () => {
    setLoadingLifts(true);
    try {
      const res = await fetch("/api/lifts");
      const data = await res.json();
      if (data.lifts) {
        setLifts(data.lifts);
        setLiftsLoaded(true);
        fetchSummaries(data.lifts.map((l: Lift) => l.id));
      }
    } catch (error) {
      console.error("Failed to fetch lifts", error);
    } finally {
      setLoadingLifts(false);
    }
  }, [fetchSummaries]);

  useEffect(() => {
    if (session) {
      fetchLifts();
    }
  }, [session, fetchLifts]);

  const handleDelete = async (liftId: string) => {
    if (!confirm("Are you sure? This deletes the folder from your Drive.")) return;
    try {
      const res = await fetch("/api/lifts", {
        method: "DELETE",
        body: JSON.stringify({ liftId }),
      });
      if (res.ok) setLifts(lifts.filter(l => l.id !== liftId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleRename = async (liftId: string) => {
    if (!newName.trim()) return;
    try {
      const res = await fetch("/api/lifts", {
        method: "PATCH",
        body: JSON.stringify({ liftId, newName }),
      });
      if (res.ok) {
        setLifts(lifts.map(l => l.id === liftId ? { ...l, name: newName } : l));
        setRenamingId(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const totalLifts = (lifts && lifts.length) || 0;

  if (!session) {
    return <LandingPage />;
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16 py-12">
        <div className="space-y-24">

          <WhatsNew ready={liftsLoaded} hasLifts={lifts.length > 0} />

          {/* Row 1: Summary */}
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-6 bg-surface swiss-border p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-[13px] mono text-foreground-muted uppercase tracking-widest">Renders</div>
                  <div className="text-3xl font-black">{totalLifts}</div>
                </div>
                <Activity className="text-foreground-muted w-6 h-6" />
              </div>
              <div className="text-[12px] mono text-foreground-muted uppercase tracking-wider leading-relaxed">
                Saved in your Google Drive under RenderLift/Lifts.
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 bg-surface border border-accent/20 p-8 flex flex-col justify-between group hover:border-accent transition-colors">
              <div className="text-base font-bold leading-tight">Upload a Blender file and get a notebook that renders it on a free Google Colab GPU.</div>
              <Link
                href="/new"
                className="mt-6 flex items-center gap-3 text-[15px] font-black uppercase tracking-widest text-accent group-hover:gap-5 transition-all"
              >
                <Plus className="w-4 h-4" />
                New render
              </Link>
            </div>
          </div>

          {/* Row 2: Recent History */}
          <div className="space-y-8 pb-24">
            <div className="flex justify-between items-end border-b border-border-subtle pb-4">
              <h2 className="text-[15px] font-black uppercase tracking-[0.2em] text-foreground-muted">Your renders</h2>
            </div>

            {loadingLifts ? (
              <div className="py-24 flex items-center gap-4 text-accent animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-[15px] font-bold uppercase tracking-widest">Loading your renders...</span>
              </div>
            ) : (!lifts || lifts.length === 0) ? (
              <div className="py-32 border border-border-subtle border-dashed flex flex-col items-center justify-center text-center space-y-6">
                <div className="text-[13px] mono text-foreground-muted uppercase">No renders yet</div>
                <p className="text-base max-w-xs text-foreground-muted leading-relaxed">Click &quot;New render&quot; to upload your first Blender file.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1">
                {lifts.map((lift, i) => (
                  <div
                    key={lift.id}
                    className="grid grid-cols-12 gap-8 items-center bg-surface swiss-border border-transparent hover:border-border-subtle p-6 transition-all group"
                  >
                    <div className="col-span-1 text-[13px] mono text-foreground-muted">0{i + 1}</div>
                    <div className="col-span-11 md:col-span-3 flex items-center gap-4">
                      <div className="min-w-0 flex-1">
                      {renamingId === lift.id ? (
                        <div className="flex items-center gap-4">
                          <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="bg-background border border-accent px-3 py-1 text-base font-bold w-full outline-none"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleRename(lift.id)}
                          />
                          <button onClick={() => handleRename(lift.id)} className="text-[13px] mono text-accent font-bold hover:underline">SAVE</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <h3 className="text-base font-bold font-mono tracking-tight truncate">{lift.name}</h3>
                          <button onClick={() => { setRenamingId(lift.id); setNewName(lift.name); }} className="opacity-0 group-hover:opacity-60 hover:text-accent transition-all">
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-4 text-[13px] mono uppercase space-y-1">
                      {summaries[lift.id]?.settings && (
                        <div className="text-foreground">{summaries[lift.id].settings}</div>
                      )}
                      <div className="text-[12px] text-foreground-muted">
                        {summaries[lift.id]?.generatedAt
                          ? `Notebook updated ${timeAgo(summaries[lift.id].generatedAt)}`
                          : `Created ${new Date(lift.createdTime).toLocaleDateString()} / ${new Date(lift.createdTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-4 flex justify-end gap-6 items-center">
                      <Link
                        href={`/new?lift=${encodeURIComponent(lift.id)}`}
                        className="text-[13px] font-black uppercase tracking-widest text-foreground-muted hover:text-accent transition-all"
                      >
                        Re-render
                      </Link>
                      <a
                        href={`https://drive.google.com/drive/folders/${lift.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] font-black uppercase tracking-widest text-accent hover:text-white hover:bg-accent px-2 py-1 transition-all"
                      >
                        View output
                      </a>
                      <button
                        onClick={() => handleDelete(lift.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500/40 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
