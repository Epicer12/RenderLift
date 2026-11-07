"use client"
import { useEffect, useSyncExternalStore } from "react"
import { X } from "lucide-react"
import { WHATS_NEW, getSeenWhatsNew, markWhatsNewSeen, subscribeWhatsNew, unseenEntries } from "@/lib/whatsNew"

interface WhatsNewProps {
    // The lift list has finished loading, so hasLifts can be trusted
    ready: boolean
    hasLifts: boolean
}

// Shown once to returning users when there are entries they haven't seen.
// A brand-new user (nothing seen, no lifts yet) skips straight to "seen".
export function WhatsNew({ ready, hasLifts }: WhatsNewProps) {
    // undefined on the server (unknown); null when this browser has never dismissed anything
    const seen = useSyncExternalStore(subscribeWhatsNew, getSeenWhatsNew, () => undefined)
    const latestId = WHATS_NEW[0].id
    const isNewUser = ready && seen === null && !hasLifts

    useEffect(() => {
        if (isNewUser) markWhatsNewSeen(latestId)
    }, [isNewUser, latestId])

    if (!ready || seen === undefined || isNewUser) return null
    const entries = unseenEntries(seen)
    if (entries.length === 0) return null

    return (
        <div className="bg-surface border border-accent/20 border-l-2 border-l-accent p-6 md:p-8 space-y-4">
            <div className="flex justify-between items-start gap-4">
                <div className="text-[13px] mono text-accent uppercase tracking-[0.2em] font-bold">What&apos;s new</div>
                <button
                    onClick={() => markWhatsNewSeen(latestId)}
                    aria-label="Dismiss what's new"
                    className="text-foreground-muted hover:text-foreground transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            {entries.map((entry) => (
                <div key={entry.id} className="space-y-2">
                    {entries.length > 1 && (
                        <div className="text-[12px] mono text-foreground-muted uppercase tracking-widest">{entry.date}</div>
                    )}
                    <ul className="list-disc list-inside space-y-1 text-base text-foreground-muted leading-relaxed">
                        {entry.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                </div>
            ))}
            <button
                onClick={() => markWhatsNewSeen(latestId)}
                className="text-[13px] font-black uppercase tracking-widest text-accent hover:underline"
            >
                Got it
            </button>
        </div>
    )
}
