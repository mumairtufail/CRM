import { motion } from 'framer-motion';
import {
    LayoutDashboard, Users, Target, Mail, FileText,
    Bell, CheckCircle2,
} from 'lucide-react';

const NAV_ITEMS = [
    { icon: LayoutDashboard, active: true },
    { icon: Users,           active: false },
    { icon: Target,          active: false },
    { icon: Mail,            active: false },
    { icon: FileText,        active: false },
];

const STATS = [
    { label: 'Total Leads',  value: '2,847',  tint: 'bg-brand-50 text-brand-700' },
    { label: 'Active Deals', value: '143',    tint: 'bg-brand2-50 text-brand2-700' },
    { label: 'Revenue MTD',  value: '$48.2k', tint: 'bg-brand-50 text-brand-700' },
];

const BARS = [40, 65, 50, 80, 60, 90, 75, 95, 70, 88];

const PIPELINE = [
    { label: 'New',       pct: 85 },
    { label: 'Qualified', pct: 62 },
    { label: 'Proposal',  pct: 40 },
    { label: 'Won',       pct: 24 },
];

/**
 * Abstract "product" visual for the hero — a soft gradient backdrop with a
 * floating dashboard mockup card, in place of stock photography.
 */
export default function HeroVisual() {
    return (
        <div className="relative w-full aspect-[4/3]">
            {/* Backdrop blobs */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden bg-gradient-to-br from-brand-50 to-white">
                <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-brand-400/30 blur-3xl" />
                <div className="absolute -bottom-14 -left-10 w-64 h-64 rounded-full bg-brand2-400/30 blur-3xl" />
            </div>

            {/* Floating dashboard card */}
            <motion.div
                initial={{ opacity: 0, y: 16, rotate: -1.5 }}
                animate={{ opacity: 1, y: 0, rotate: -1.5 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-6 sm:inset-8 rounded-2xl bg-white shadow-xl border border-slate-100 overflow-hidden flex"
            >
                {/* Nav strip */}
                <div className="hidden sm:flex w-12 shrink-0 flex-col items-center gap-2 py-4 border-r border-slate-100 bg-slate-50/60">
                    {NAV_ITEMS.map(({ icon: Icon, active }, i) => (
                        <div key={i}
                             className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                 active ? 'bg-brand-600 text-white' : 'text-slate-400'
                             }`}>
                            <Icon className="w-3.5 h-3.5" />
                        </div>
                    ))}
                </div>

                <div className="flex-1 p-4 sm:p-5 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-800 text-xs font-bold">Dashboard</span>
                        <span className="text-[10px] text-slate-300 font-medium">This month</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                        {STATS.map(({ label, value, tint }) => (
                            <div key={label} className={`rounded-lg p-2 ${tint}`}>
                                <div className="text-[8px] font-medium opacity-60 mb-0.5 truncate">{label}</div>
                                <div className="text-xs sm:text-sm font-bold">{value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                        <div className="col-span-3 rounded-lg bg-slate-50 border border-slate-100 p-2">
                            <div className="text-slate-400 text-[8px] mb-1.5">New leads</div>
                            <div className="flex items-end gap-0.5" style={{ height: '44px' }}>
                                {BARS.map((h, i) => (
                                    <motion.div key={i} className="flex-1 rounded-sm bg-brand-500/70"
                                         initial={{ height: 0 }}
                                         animate={{ height: `${h}%` }}
                                         transition={{ duration: 0.6, delay: 0.6 + i * 0.05, ease: [0.22, 1, 0.36, 1] }} />
                                ))}
                            </div>
                        </div>
                        <div className="col-span-2 rounded-lg bg-slate-50 border border-slate-100 p-2">
                            <div className="text-slate-400 text-[8px] mb-1.5">Pipeline</div>
                            <div className="space-y-1">
                                {PIPELINE.map(({ label, pct }) => (
                                    <div key={label}>
                                        <div className="h-1 bg-slate-200 rounded-full">
                                            <motion.div className="h-full rounded-full bg-brand2-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.7, delay: 0.9, ease: 'easeOut' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Floating chip — top right */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -top-4 right-2 sm:right-6 bg-white rounded-xl shadow-lg border border-slate-100 px-3 py-2 flex items-center gap-2"
            >
                <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                    <Bell className="w-3 h-3 text-brand-600" />
                </div>
                <div className="text-[10px] leading-tight">
                    <div className="font-semibold text-slate-800">New lead</div>
                    <div className="text-slate-400">Apex Digital</div>
                </div>
            </motion.div>

            {/* Floating chip — bottom left */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-5 -left-3 sm:-left-6 bg-white rounded-2xl shadow-lg border border-slate-100 px-4 py-3 flex items-center gap-3 max-w-[220px]"
            >
                <div className="w-8 h-8 rounded-full bg-brand2-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-brand2-700" />
                </div>
                <p className="text-slate-700 text-xs font-medium leading-snug">
                    Invoice #041 paid — <span className="text-slate-400 font-normal">deal won</span>
                </p>
            </motion.div>
        </div>
    );
}
