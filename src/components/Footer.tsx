import Link from 'next/link';

export function Footer() {
    return (
        <footer className="w-full py-6 mt-12 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-black">
            <div className="max-w-4xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <div>
                    &copy; {new Date().getFullYear()} RenderLift. All rights reserved.
                </div>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <Link
                        href="/terms"
                        target="_blank"
                        className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                    >
                        Terms of Service
                    </Link>
                    <Link
                        href="/privacy"
                        target="_blank"
                        className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                    >
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </footer>
    );
}
