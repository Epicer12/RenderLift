import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
    return (
        <footer className="w-full py-12 border-t border-border-subtle bg-background mt-32">
            <div className="max-w-[1440px] mx-auto px-8 md:px-16 flex flex-col md:flex-row justify-between items-center mono text-foreground-muted uppercase tracking-[0.2em]">
                {/* Branding & Logo */}
                <div className="flex items-center gap-4 group text-[17px]">
                    <Logo className="w-8 h-8 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                    <div>
                        &copy; {new Date().getFullYear()} <span className="font-bold"><span className="text-blue-500">Render</span><span className="text-orange-500">Lift</span></span> <span className="text-accent">/</span> Build_1.0
                    </div>
                </div>

                {/* Policies & Terms */}
                <div className="flex gap-8 mt-4 md:mt-0 text-[13px]">
                    <Link
                        href="/terms"
                        className="hover:text-foreground transition-colors"
                    >
                        Terms_of_Service
                    </Link>
                    <Link
                        href="/privacy"
                        className="hover:text-foreground transition-colors"
                    >
                        Privacy_Policy
                    </Link>
                </div>
            </div>
        </footer>
    );
}
