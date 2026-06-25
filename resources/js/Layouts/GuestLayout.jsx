import { Link } from '@inertiajs/react'
import Logo from '@/Components/Common/Logo'

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex" style={{ background: '#F4F2FF' }}>

            {/* ── Left panel: branding ───────────────────────────────────── */}
            <div
                className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between p-10 shrink-0"
                style={{ background: 'linear-gradient(155deg, #0D0B18 0%, #1A1232 100%)' }}
            >
                {/* Top accent line */}
                <div
                    className="absolute top-0 left-0 h-px w-[480px]"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)' }}
                />

                {/* Logo */}
                <Link href="/">
                    <Logo size={36} textColor="text-white" />
                </Link>

                {/* Hero copy */}
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                         style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                        <span className="text-violet-300 text-[11px] font-semibold uppercase tracking-widest">
                            Trusted CRM Platform
                        </span>
                    </div>

                    <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-4">
                        Turn leads into<br />
                        <span style={{ background: 'linear-gradient(90deg, #A78BFA, #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            revenue.
                        </span>
                    </h2>
                    <p className="text-white/40 text-base leading-relaxed">
                        Manage every lead, campaign, and deal in one place.
                        Your pipeline, your inbox, your invoices — all in sync.
                    </p>

                    {/* Stats row */}
                    <div className="flex gap-6 mt-8 pt-8 border-t border-white/[0.08]">
                        {[
                            { value: '10k+', label: 'Active users' },
                            { value: '3M+',  label: 'Leads tracked' },
                            { value: '99.9%', label: 'Uptime SLA' },
                        ].map(({ value, label }) => (
                            <div key={label}>
                                <div className="text-2xl font-black text-white leading-none">{value}</div>
                                <div className="text-white/30 text-xs mt-1">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer copy */}
                <p className="text-white/20 text-xs">
                    &copy; {new Date().getFullYear()} LeadFlow by Lumenia Lab.
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
                    &copy; {new Date().getFullYear()} LeadFlow. All rights reserved.
                </p>
            </div>
        </div>
    )
}
