"use client"

export function Logo({ className = "w-6 h-6" }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
            <img
                src="/logo.png"
                alt="RenderLift Logo"
                className="w-full h-full object-contain"
            />
        </div>
    );
}
