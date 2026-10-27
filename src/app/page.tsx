"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, Edit2, Loader2, Zap, Activity, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { LandingPage } from "@/components/LandingPage";

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
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (session) {
      fetchLifts();
    }
  }, [session]);

  const fetchLifts = async () => {
    setLoadingLifts(true);
    try {
      const res = await fetch("/api/lifts");
      const data = await res.json();
      if (data.lifts) {
        setLifts(data.lifts);
      }
    } catch (error) {
      console.error("Failed to fetch lifts", error);
    } finally {
      setLoadingLifts(false);
    }
  };

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

  // Compute "Energy" Estimate
  const totalLifts = (lifts && lifts.length) || 0;
  const estimatedEnergy = Math.min(100, (totalLifts * 12.5));

  if (!session) {
    return <LandingPage />;
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16 py-12">
        <div className="space-y-24">

          {/* Row 1: Operations Data */}
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-4 bg-surface swiss-border p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-[13px] mono text-foreground-muted uppercase tracking-widest">Compute Load</div>
                  <div className="text-3xl font-black">{estimatedEnergy}%</div>
                </div>
                <Zap className="text-accent w-6 h-6" />
              </div>
              <div className="w-full bg-background h-1">
                <div className="bg-accent h-full transition-all duration-1000" style={{ width: `${estimatedEnergy}%` }} />
              </div>
              <div className="text-[12px] mono text-foreground-muted uppercase tracking-wider leading-relaxed">
                Estimate based on session activity. Refreshes every 24h.
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 bg-surface swiss-border p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-[13px] mono text-foreground-muted uppercase tracking-widest">Active Lifts</div>
                  <div className="text-3xl font-black">{totalLifts}</div>
                </div>
                <Activity className="text-foreground-muted w-6 h-6" />
              </div>
              <div className="text-[12px] mono text-foreground-muted uppercase tracking-wider leading-relaxed">
                Total render instances registered in your Google Drive storage.
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 bg-surface border border-accent/20 p-8 flex flex-col justify-between group hover:border-accent transition-colors">
              <div className="text-base font-bold leading-tight">Start a new secure render pipeline using remote cloud nodes.</div>
              <Link
                href="/new"
                className="mt-6 flex items-center gap-3 text-[15px] font-black uppercase tracking-widest text-accent group-hover:gap-5 transition-all"
              >
                <Plus className="w-4 h-4" />
                New Operation_
              </Link>
            </div>
          </div>

          {/* Row 2: Recent History */}
          <div className="space-y-8 pb-24">
            <div className="flex justify-between items-end border-b border-border-subtle pb-4">
              <h2 className="text-[15px] font-black uppercase tracking-[0.2em] text-foreground-muted">Recent Render History</h2>
              <div className="text-[13px] mono text-foreground-muted uppercase">Sync Status: Online</div>
            </div>

            {loadingLifts ? (
              <div className="py-24 flex items-center gap-4 text-accent animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-[15px] font-bold uppercase tracking-widest">Polling Google Drive Data...</span>
              </div>
            ) : (!lifts || lifts.length === 0) ? (
              <div className="py-32 border border-border-subtle border-dashed flex flex-col items-center justify-center text-center space-y-6">
                <div className="text-[13px] mono text-foreground-muted uppercase">Storage Empty</div>
                <p className="text-base max-w-xs text-foreground-muted leading-relaxed">No render lifts found. Click &quot;New Operation&quot; to begin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1">
                {lifts.map((lift, i) => (
                  <div
                    key={lift.id}
                    className="grid grid-cols-12 gap-8 items-center bg-surface swiss-border border-transparent hover:border-border-subtle p-6 transition-all group"
                  >
                    <div className="col-span-1 text-[13px] mono text-foreground-muted">0{i + 1}</div>
                    <div className="col-span-11 md:col-span-5">
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
                    <div className="col-span-6 md:col-span-3 text-[13px] mono text-foreground-muted uppercase">
                      {new Date(lift.createdTime).toLocaleDateString()} / {new Date(lift.createdTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="col-span-6 md:col-span-3 flex justify-end gap-6 items-center">
                      <a
                        href={`https://drive.google.com/drive/folders/${lift.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] font-black uppercase tracking-widest text-accent hover:text-white hover:bg-accent px-2 py-1 transition-all"
                      >
                        View_Output
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
