"use client"

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, LogOut, Plus, LayoutDashboard, Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { SettingsModal } from "./SettingsModal";
import { Logo } from "./Logo";
import clsx from "clsx";

export function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!session) return null;

    const navLinks = [
        { name: "Lifts", href: "/", icon: LayoutDashboard },
        { name: "New Operation", href: "/new", icon: Plus },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border-subtle px-4 md:px-16 py-4">
                <div className="max-w-[1440px] mx-auto flex justify-between items-center">
                    {/* Logo/Home */}
                    <div className="flex items-center gap-12">
                        <Link href="/" className="text-[26px] font-bold tracking-tighter uppercase group flex items-center gap-4">
                            <Logo className="w-11 h-11" />
                            <div className="flex items-center gap-2">
                                <span className="text-blue-500">Render</span>
                                <span className="text-orange-500">Lift</span>
                                <span className="text-accent ml-1">/</span>
                                <span className="text-[13px] mono text-foreground-muted group-hover:text-foreground transition-colors">1.0</span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8">
                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 text-foreground-muted hover:text-foreground"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        {/* Primary Nav [Right Aligned] - Desktop */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={clsx(
                                        "text-[13px] mono font-bold uppercase tracking-widest transition-all hover:text-accent flex items-center gap-2",
                                        pathname === link.href ? "text-accent" : "text-foreground-muted"
                                    )}
                                >
                                    <link.icon className="w-3.5 h-3.5" />
                                    {link.name}_
                                </Link>
                            ))}
                        </div>

                        <div className="h-4 w-[1px] bg-border-subtle mx-2 hidden md:block" />

                        {/* Controls */}
                        <div className="hidden md:flex items-center gap-6">
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 border border-transparent hover:border-border-subtle hover:bg-surface transition-all group"
                                title="Global Settings"
                            >
                                <Settings className="w-4 h-4 text-foreground-muted group-hover:text-accent group-hover:rotate-45 transition-all duration-500" />
                                <span className="text-[13px] mono font-bold uppercase tracking-widest text-foreground-muted group-hover:text-foreground">Settings</span>
                            </button>

                            <div className="h-4 w-[1px] bg-border-subtle mx-2" />

                            <div className="flex items-center gap-4 group">
                                <div className="text-right hidden sm:block">
                                    <div className="text-[13px] mono font-bold truncate max-w-[120px]">{session.user?.name}</div>
                                    <div className="text-[11px] mono text-accent uppercase tracking-tighter">Verified_Op</div>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="p-2 border border-transparent hover:border-red-500/20 hover:bg-red-500/5 transition-all text-foreground-muted hover:text-red-500"
                                    title="Terminate Session"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-[calc(100%+1px)] left-0 right-0 bg-background border-b border-border-subtle p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={clsx(
                                    "text-[13px] mono font-bold uppercase tracking-widest transition-all hover:text-accent flex items-center gap-2 p-3 rounded-md hover:bg-surface",
                                    pathname === link.href ? "text-accent bg-surface" : "text-foreground-muted"
                                )}
                            >
                                <link.icon className="w-4 h-4" />
                                {link.name}_
                            </Link>
                        ))}
                        <div className="h-[1px] bg-border-subtle w-full my-2" />
                        <button
                            onClick={() => {
                                setIsSettingsOpen(true);
                                setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center gap-2 p-3 text-foreground-muted hover:text-foreground hover:bg-surface rounded-md transition-all text-left w-full"
                        >
                            <Settings className="w-4 h-4" />
                            <span className="text-[13px] mono font-bold uppercase tracking-widest">Settings</span>
                        </button>
                        <button
                            onClick={() => signOut()}
                            className="flex items-center gap-2 p-3 text-foreground-muted hover:text-red-500 hover:bg-red-500/5 rounded-md transition-all text-left w-full"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-[13px] mono font-bold uppercase tracking-widest">Sign Out ({session.user?.name})</span>
                        </button>
                    </div>
                )}
            </nav>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            {/* Spacer for fixed nav */}
            <div className="h-16" />
        </>
    );
}
