"use client"
import { useEffect } from "react"
import { Session } from "next-auth"
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react"

const RECONSENT_KEY = "renderlift_reconsent_at"
const RECONSENT_COOLDOWN_MS = 5 * 60 * 1000

// When Google didn't give us a refresh token (silent sign-in) or it stopped working,
// send the user through the consent screen once to get a fresh one.
function SessionGuard() {
    const { data: session } = useSession()
    const error = session?.error

    useEffect(() => {
        if (!error) return

        let lastAttempt = 0
        try {
            lastAttempt = Number(sessionStorage.getItem(RECONSENT_KEY)) || 0
        } catch {
            // Storage blocked (private mode etc.): treat as never attempted
        }

        // Already tried recently and it didn't help: sign out instead of looping
        if (Date.now() - lastAttempt < RECONSENT_COOLDOWN_MS) {
            signOut()
            return
        }

        try {
            sessionStorage.setItem(RECONSENT_KEY, String(Date.now()))
        } catch {
            // Without storage we can't detect a loop, but re-consent is still the right move
        }
        signIn("google", undefined, { prompt: "consent" })
    }, [error])

    return null
}

export function Providers({ children, session }: { children: React.ReactNode, session: Session | null }) {
    return (
        <SessionProvider session={session}>
            <SessionGuard />
            {children}
        </SessionProvider>
    )
}
