// Google Analytics helpers. Analytics storage is denied until the visitor accepts (Consent Mode),
// and events never carry file names, lift ids, emails or Drive ids, only coarse categories.

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void
    }
}

export const CONSENT_KEY = "renderlift_analytics_consent"
const SIGN_IN_PENDING_KEY = "renderlift_signin_pending"

export type ConsentChoice = "granted" | "denied"

export function getStoredConsent(): ConsentChoice | null {
    try {
        const value = localStorage.getItem(CONSENT_KEY)
        return value === "granted" || value === "denied" ? value : null
    } catch {
        return null
    }
}

// Components read the choice with useSyncExternalStore; this tells them when it changes.
const consentListeners = new Set<() => void>()
let sessionChoice: ConsentChoice | null = null // used when storage is blocked

export function subscribeConsent(listener: () => void) {
    consentListeners.add(listener)
    return () => { consentListeners.delete(listener) }
}

export function getConsentSnapshot(): ConsentChoice | null {
    return getStoredConsent() ?? sessionChoice
}

export function setAnalyticsConsent(choice: ConsentChoice) {
    sessionChoice = choice
    try {
        localStorage.setItem(CONSENT_KEY, choice)
    } catch {
        // Storage blocked: the choice only lasts for this page view
    }
    window.gtag?.("consent", "update", { analytics_storage: choice })
    consentListeners.forEach(listener => listener())
}

type EventParams = Record<string, string | number | boolean>

function trackEvent(name: string, params?: EventParams) {
    if (typeof window === "undefined") return
    window.gtag?.("event", name, params)
}

// Sign-in goes through a Google redirect, so remember it and report it once the session exists.
export function markSignInPending() {
    try {
        sessionStorage.setItem(SIGN_IN_PENDING_KEY, "1")
    } catch {
        // Storage blocked: the sign_in event is simply skipped
    }
}

export function trackSignInIfPending() {
    try {
        if (sessionStorage.getItem(SIGN_IN_PENDING_KEY) !== "1") return
        sessionStorage.removeItem(SIGN_IN_PENDING_KEY)
    } catch {
        return
    }
    trackEvent("sign_in")
}

export function trackUploadComplete(file: { name: string, size: number }) {
    const mb = file.size / (1024 * 1024)
    trackEvent("upload_complete", {
        file_type: file.name.toLowerCase().endsWith(".zip") ? "zip" : "blend",
        size_mb: mb < 100 ? "<100" : mb < 500 ? "100-500" : mb < 1000 ? "500-1000" : "1000+",
    })
}

export function trackNotebookGenerated(info: { rerender: boolean, engine?: string, device?: string }) {
    trackEvent("notebook_generated", {
        rerender: info.rerender,
        engine: info.engine ?? "SCENE",
        device: info.device ?? "CUDA",
    })
}

export function trackNotebookOpened() {
    trackEvent("notebook_opened")
}
