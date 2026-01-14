"use client"
import { signIn, signOut, useSession } from "next-auth/react"

export function LoginButton() {
    const { data: session } = useSession()
    if (session) {
        return (
            <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-6">
                <span className="text-[10px] md:text-xs mono text-foreground-muted uppercase tracking-widest truncate max-w-[150px] md:max-w-none text-right">User: {session.user?.email}</span>
                <button
                    onClick={() => signOut()}
                    className="px-4 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-widest border border-border-subtle hover:bg-surface transition-colors w-full md:w-auto"
                >
                    Sign out
                </button>
            </div>
        )
    }
    return (
        <button
            onClick={() => signIn("google")}
            className="px-6 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest bg-accent text-white hover:bg-blue-600 transition-colors w-full md:w-auto"
        >
            Login with Google
        </button>
    )
}
