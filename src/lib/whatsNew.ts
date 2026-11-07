// "What's new" entries shown once to returning users on the dashboard. Newest first.
// To announce something: add an entry at the top with a new id (the date works well).

export interface WhatsNewEntry {
    id: string
    date: string
    items: string[]
}

export const WHATS_NEW: WhatsNewEntry[] = [
    {
        id: "2026-11-07",
        date: "November 7, 2026",
        items: [
            "Zip projects with a single .blend file at the top now render without any extra setup.",
            "Your dashboard shows the settings each render uses and when its notebook was last updated.",
            "Re-render any earlier render with new settings, without uploading again.",
            "If Colab disconnects, run the notebook again: frames that are already finished are skipped.",
            "New renders are named after your file instead of a number.",
            "Clearer wording across the app, and an optional analytics choice (see the privacy policy).",
        ],
    },
]

const SEEN_KEY = "renderlift_whatsnew_seen"
const listeners = new Set<() => void>()
let sessionSeen: string | null = null // used when storage is blocked

export function subscribeWhatsNew(listener: () => void) {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
}

// The id of the newest entry this browser has already seen, or null if none.
export function getSeenWhatsNew(): string | null {
    try {
        return localStorage.getItem(SEEN_KEY) ?? sessionSeen
    } catch {
        return sessionSeen
    }
}

export function markWhatsNewSeen(id: string) {
    sessionSeen = id
    try {
        localStorage.setItem(SEEN_KEY, id)
    } catch {
        // Storage blocked: dismissed for this page view only
    }
    listeners.forEach(listener => listener())
}

// Entries newer than the one the user last saw (at most 3).
export function unseenEntries(seen: string | null): WhatsNewEntry[] {
    const idx = WHATS_NEW.findIndex(e => e.id === seen)
    return (idx === -1 ? WHATS_NEW : WHATS_NEW.slice(0, idx)).slice(0, 3)
}
