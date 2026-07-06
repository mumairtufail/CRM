import { Link } from '@inertiajs/react'
import Logo from '@/Components/Common/Logo'

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex" style={{ background: 'rgb(var(--brand-tint))' }}>

            {/* ── Left panel: branding ───────────────────────────────────── */}
            <div
                className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between p-10 shrink-0"
                style={{ background: 'linear-gradient(155deg, rgb(var(--brand-ink2)) 0%, rgb(var(--brand-ink)) 100%)' }}
            >
                {/* Top accent line */}
                <div
                    className="absolute top-0 left-0 h-px w-[480px]"
                    style={{ background: 'linear-gradient(90deg, transparent, rgb(var(--brand-500) / 0.5), transparent)' }}
                />

                {/* Logo */}
                <Link href="/">
                    <Logo size={36} textColor="text-white" />
                </Link>

                {/* Hero copy */}
                <div>
                    <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-4">
                        Turn leads into<br />
                        <span style={{ background: 'linear-gradient(90deg, rgb(var(--brand-400)), rgb(var(--brand2-400)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            revenue.
                        </span>
                    </h2>
                    <p className="text-white/40 text-base leading-relaxed">
                        Manage every lead, campaign, and deal in one place.
                        Your pipeline, your inbox, your invoices — all in sync.
                    </p>
                </div>

                {/* Footer copy */}
                <p className="text-white/20 text-xs">
                    &copy; {new Date().getFullYear()} Lumenia CRM by Lumenia Lab.
                </p>
            </div>

            {/* ── Right panel: form ──────────────────────────────────────── */}
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 overflow-y-auto">

                {/* Mobile-only logo */}
                <div className="lg:hidden mb-8">
                    <Link href="/">
                        <Logo size={34} />
                    </Link>
                </div>

                <div className="w-full max-w-[400px]">
                    {children}
                </div>

                <p className="mt-8 text-slate-400 text-xs text-center lg:hidden">
                    &copy; {new Date().getFullYear()} Lumenia CRM. All rights reserved.
                </p>
            </div>
        </div>
    )
}
