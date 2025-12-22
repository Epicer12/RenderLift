"use client"
import { signIn, signOut, useSession } from "next-auth/react"

export function LoginButton() {
    const { data: session } = useSession()
    if (session) {
        return (
            <div className="flex items-center gap-6">
                <span className="text-xs mono text-foreground-muted uppercase tracking-widest">User: {session.user?.email}</span>
                <button
                    onClick={() => signOut()}
                    className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest border border-border-subtle hover:bg-surface transition-colors"
                >
                    Sign out
                </button>
            </div>
        )
    }
    return (
        <button
            onClick={() => signIn("google")}
            className="px-6 py-2 text-xs font-bold uppercase tracking-widest bg-accent text-white hover:bg-blue-600 transition-colors"
        >
            Login with Google
        </button>
    )
}
