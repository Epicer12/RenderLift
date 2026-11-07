"use client"
import { useSyncExternalStore } from "react"
import { getConsentSnapshot, setAnalyticsConsent, subscribeConsent } from "@/lib/analytics"

// Lets a visitor change their analytics choice later (used on the privacy page).
export function AnalyticsChoice() {
    const choice = useSyncExternalStore(subscribeConsent, getConsentSnapshot, () => null)

    return (
        <div className="not-prose flex flex-wrap items-center gap-4 mb-4">
            <span className="text-sm">
                Analytics: <strong>{choice === "granted" ? "on" : choice === "denied" ? "off" : "not chosen yet (off)"}</strong>
            </span>
            <button
                onClick={() => setAnalyticsConsent("granted")}
                disabled={choice === "granted"}
                className="px-4 py-2 border border-border-subtle text-sm font-bold disabled:opacity-40"
            >
                Turn on
            </button>
            <button
                onClick={() => setAnalyticsConsent("denied")}
                disabled={choice === "denied"}
                className="px-4 py-2 border border-border-subtle text-sm font-bold disabled:opacity-40"
            >
                Turn off
            </button>
        </div>
    )
}
