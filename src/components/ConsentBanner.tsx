"use client"
import { useSyncExternalStore } from "react"
import Link from "next/link"
import { getConsentSnapshot, setAnalyticsConsent, subscribeConsent } from "@/lib/analytics"

// One-time Accept / Decline bar for Google Analytics. Hidden once a choice is stored.
export function ConsentBanner() {
    // undefined on the server (unknown); null once we know the visitor has not chosen yet
    const consent = useSyncExternalStore(subscribeConsent, getConsentSnapshot, () => undefined)

    if (consent !== null) return null

    return (
        <div
            role="dialog"
            aria-label="Analytics consent"
            className="fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-border-subtle px-4 md:px-16 py-5"
        >
            <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="text-[13px] mono text-foreground-muted leading-relaxed uppercase tracking-wider max-w-3xl">
                    We use Google Analytics to count visits and a few actions (sign in, upload, notebook created).
                    No file names or Drive content are sent.{" "}
                    <Link href="/privacy" className="text-accent hover:underline">Privacy policy</Link>
                </p>
                <div className="flex gap-3 shrink-0">
                    <button
                        onClick={() => setAnalyticsConsent("denied")}
                        className="px-6 py-3 swiss-border text-foreground font-bold uppercase tracking-widest text-xs hover:border-foreground transition-all"
                    >
                        Decline
                    </button>
                    <button
                        onClick={() => setAnalyticsConsent("granted")}
                        className="px-6 py-3 bg-accent text-white font-bold uppercase tracking-widest text-xs hover:bg-blue-600 transition-all"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    )
}
