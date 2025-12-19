"use client"
import { signIn, signOut, useSession } from "next-auth/react"

export function LoginButton() {
    const { data: session } = useSession()
    if (session) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Signed in as {session.user?.email}</span>
                <button
                    onClick={() => signOut()}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                    Sign out
                </button>
            </div>
        )
    }
    return (
        <button
            onClick={() => signIn("google")}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
            Sign in with Google
        </button>
    )
}
