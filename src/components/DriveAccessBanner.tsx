"use client"
import { usePathname } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"

// Shown on the pages that use Drive when the user signed in without giving RenderLift
// access to its own Drive files. Nothing redirects automatically, so declining twice can't loop.
export function DriveAccessBanner() {
    const { data: session } = useSession()
    const pathname = usePathname()

    if (session?.error !== "MissingDriveScope") return null
    if (pathname !== "/" && !pathname.startsWith("/new")) return null

    return (
        <div role="alert" className="bg-surface border-b border-red-500/40 px-4 md:px-16 py-5">
            <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="text-[13px] mono text-foreground leading-relaxed uppercase tracking-wider max-w-3xl">
                    RenderLift needs permission to create files in your Google Drive. Without it, uploads and your renders
                    can&apos;t work. It can only see files it creates itself.
                </p>
                <div className="flex gap-3 shrink-0">
                    <button
                        onClick={() => signOut()}
                        className="px-6 py-3 swiss-border text-foreground font-bold uppercase tracking-widest text-xs hover:border-foreground transition-all"
                    >
                        Sign out
                    </button>
                    <button
                        onClick={() => signIn("google", undefined, { prompt: "consent" })}
                        className="px-6 py-3 bg-accent text-white font-bold uppercase tracking-widest text-xs hover:bg-blue-600 transition-all"
                    >
                        Grant access
                    </button>
                </div>
            </div>
        </div>
    )
}
