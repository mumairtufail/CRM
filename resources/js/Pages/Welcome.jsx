import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Mail, FileText, Zap, Briefcase,
    Check, ChevronDown, Star, Target,
    TrendingUp, Menu, X, Building2,
    Cpu, LayoutDashboard, CheckCircle2,
    Upload, ArrowRight, Bell,
} from 'lucide-react';

// ─── Variants ─────────────────────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
    hidden: {},
    show:   { transition: { staggerChildren: 0.1 } },
};
const scaleIn = {
    hidden: { opacity: 0, scale: 0.88 },
    show:   { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
    { icon: Users,     title: 'Lead Management',   description: 'Add leads manually, import from CSV, or pull via AI. Every lead gets its own timeline, tags, and activity log.', accent: '#7C3AED' },
    { icon: Mail,      title: 'Email Campaigns',    description: 'Write once, send to thousands. Track who opened, clicked, and replied — per contact, not just in aggregate.', accent: '#3B82F6' },
    { icon: Target,    title: 'Sales Pipeline',     description: 'A Kanban board for your deals. Drag cards between stages, filter by tag or status, see what\'s stuck.', accent: '#10B981' },
    { icon: FileText,  title: 'Invoicing',          description: 'Create an invoice in 30 seconds. Mark it sent, track payment. No separate tool, no copy-pasting client details.', accent: '#F59E0B' },
    { icon: Cpu,       title: 'AI Prospecting',     description: 'Describe your ideal customer and let AI find and import matching leads directly into your workspace.', accent: '#8B5CF6' },
    { icon: Briefcase, title: 'Clients & Projects', description: 'Flip a lead to client in one click. Manage their projects, files, and tasks in the same place.', accent: '#14B8A6' },
];

const CHIPS = [
    { icon: Bell,         label: 'New lead',     sub: 'Apex Digital · just now', iconBg: 'rgba(124,58,237,0.18)', iconColor: '#C4B5FD', dotBg: '#7C3AED', pos: '-right-10 top-8',    floatY: -7, dur: 3.2, delay: 0.9  },
    { icon: Mail,         label: 'Email opened', sub: 'Ahmed K. · 2 min ago',    iconBg: 'rgba(59,130,246,0.18)', iconColor: '#93C5FD', dotBg: '#3B82F6', pos: '-right-12 bottom-24', floatY: -5, dur: 2.8, delay: 1.05 },
    { icon: CheckCircle2, label: 'Invoice paid', sub: '#041 · PKR 85,000',       iconBg: 'rgba(16,185,129,0.18)', iconColor: '#6EE7B7', dotBg: '#10B981', pos: '-left-8 bottom-10',  floatY: -6, dur: 3.6, delay: 1.2  },
];

const TESTIMONIALS = [
    { name: 'Bilal Akhtar',   role: 'Head of Sales, Nexara Pvt Ltd',   avatar: 'BA', rating: 5, text: "We had leads in five WhatsApp groups and a shared spreadsheet nobody could agree on. Now everything's in one place and our follow-up rate actually went up." },
    { name: 'Sarah Mitchell', role: 'Founder, Clearpath Consulting',    avatar: 'SM', rating: 5, text: "The email tracking sold me. Ahmed opened my proposal email three times yesterday — so I called him this morning. Closed the deal before lunch." },
    { name: 'Kamran Yousaf',  role: 'CEO, Byte Republic',               avatar: 'KY', rating: 5, text: "We run three client accounts from one platform using different workspaces. Each team only sees their own data. It just works the way you'd expect it to." },
];

const PRICING = [
    {
        name: 'Free', price: 'PKR 0', period: 'forever',
        description: 'Good for solo founders or freelancers starting out.',
        features: ['1 workspace', 'Up to 250 leads', 'Basic pipeline board', '100 emails / month', 'Public lead capture form'],
        cta: 'Create Free Account', ctaHref: '/register', highlight: false,
    },
    {
        name: 'Pro', price: 'PKR 7,900', period: 'per seat / month',
        description: 'For small teams that need the full toolkit.',
        features: ['Unlimited workspaces', 'Unlimited leads', 'Full pipeline & Kanban', '10,000 emails / month', 'AI prospecting', 'Invoicing', 'CSV + Sheets import', 'Priority support'],
        cta: 'Start 14-Day Trial', ctaHref: '/register', highlight: true,
    },
    {
        name: 'Business', price: 'PKR 19,900', period: 'per seat / month',
        description: 'For agencies or larger teams with heavier requirements.',
        features: ['Everything in Pro', 'Client & project management', 'IMAP inbox', 'Custom email templates', 'Admin portal + impersonation', 'API access', 'Onboarding call', 'SLA-backed support'],
        cta: 'Talk to Us', ctaHref: '#', highlight: false,
    },
];

const FAQS = [
    { q: 'Do I need a credit card to sign up?', a: 'No. The free plan stays free forever and trial plans need no payment details upfront. You only enter billing info when you decide to upgrade.' },
    { q: 'Can I bring in my existing leads?', a: 'Yes — upload a CSV or connect a Google Sheet. The importer maps your columns, previews the import, and lets you confirm before anything is saved.' },
    { q: 'How are workspaces separated?', a: 'Each workspace is completely isolated at the database level. Users in workspace A cannot see or access anything in workspace B, even if they are the same person running both.' },
    { q: 'Which email providers work for campaigns?', a: 'Anything with SMTP credentials — Gmail, Outlook 365, SendGrid, Mailgun, Brevo, Postmark, and your own mail server.' },
    { q: 'Is the data stored securely?', a: 'Yes. All connections are TLS-encrypted, data is isolated by workspace. Backups run daily.' },
    { q: 'Can I convert a lead into a client and invoice them?', a: 'One click converts the lead record into a client. From there create a project and send an invoice — without re-entering any details.' },
];

const STEPS = [
    { num: '01', icon: Building2,  title: 'Create your workspace', description: 'Sign up, pick a name, and you\'re in. The whole setup takes under two minutes.' },
    { num: '02', icon: Upload,     title: 'Add your leads',         description: 'Import a spreadsheet, type them in, or describe who you\'re targeting and let AI find them.' },
    { num: '03', icon: TrendingUp, title: 'Work your pipeline',     description: 'Send emails, log calls, move deals through stages, create invoices. Everything in one tab.' },
];

// ─── Mock UI ──────────────────────────────────────────────────────────────────

function MockSidebar() {
    const items = [
        { icon: LayoutDashboard, label: 'Dashboard', active: true  },
        { icon: Users,           label: 'Leads',     active: false },
        { icon: Target,          label: 'Pipeline',  active: false },
        { icon: Mail,            label: 'Campaigns', active: false },
        { icon: FileText,        label: 'Invoices',  active: false },
        { icon: Briefcase,       label: 'Projects',  active: false },
    ];
    return (
        <div className="hidden sm:flex w-44 flex-shrink-0 flex-col border-r border-white/5 p-3"
             style={{ background: 'linear-gradient(180deg,#0D0B18,#130F22)' }}>
            <div className="flex items-center gap-1.5 mb-4 px-2">
                <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                    <Zap className="w-3 h-3 text-white" />
                </div>
                <span className="text-white text-xs font-semibold truncate">My Workspace</span>
            </div>
            {items.map(({ icon: Icon, label, active }) => (
                <div key={label}
                     className={`flex items-center gap-2 px-2 py-1.5 rounded-md mb-0.5 text-[11px] ${
                         active ? 'bg-violet-600/20 text-violet-300' : 'text-white/40'
                     }`}>
                    <Icon className="w-3 h-3 flex-shrink-0" />{label}
                </div>
            ))}
        </div>
    );
}

function MockDashboard() {
    const stats = [
        { label: 'Total Leads',  value: '2,847',  color: 'text-blue-300',   bg: 'bg-blue-500/10'   },
        { label: 'Active Deals', value: '143',    color: 'text-green-300',  bg: 'bg-green-500/10'  },
        { label: 'Revenue MTD',  value: '$48.2k', color: 'text-violet-300', bg: 'bg-violet-500/10' },
        { label: 'Emails Sent',  value: '12,400', color: 'text-amber-300',  bg: 'bg-amber-500/10'  },
    ];
    const bars     = [40,65,50,80,60,90,75,95,70,88,65,100];
    const pipeline = [
        { label: 'New',       pct: 85, color: 'bg-blue-500'   },
        { label: 'Qualified', pct: 62, color: 'bg-violet-500' },
        { label: 'Proposal',  pct: 40, color: 'bg-amber-500'  },
        { label: 'Won',       pct: 24, color: 'bg-green-500'  },
    ];
    return (
        <div className="flex-1 p-3 overflow-hidden">
            <div className="text-white/70 text-xs font-semibold mb-2">Dashboard</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3">
                {stats.map(({ label, value, color, bg }) => (
                    <div key={label} className={`rounded-lg p-2 border border-white/5 ${bg}`}>
                        <div className="text-white/40 text-[9px] mb-0.5">{label}</div>
                        <div className={`text-sm font-bold ${color}`}>{value}</div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-5 gap-1.5">
                <div className="col-span-3 rounded-lg bg-white/[0.03] border border-white/5 p-2">
                    <div className="text-white/40 text-[9px] mb-1.5">New leads (30 days)</div>
                    <div className="flex items-end gap-0.5" style={{ height: '52px' }}>
                        {bars.map((h, i) => (
                            <div key={i} className="flex-1 rounded-sm"
                                 style={{ height: `${h}%`, background: 'linear-gradient(180deg,#7C3AED,#4F46E5)', opacity: 0.85 }} />
                        ))}
                    </div>
                </div>
                <div className="col-span-2 rounded-lg bg-white/[0.03] border border-white/5 p-2">
                    <div className="text-white/40 text-[9px] mb-2">Pipeline</div>
                    <div className="space-y-1.5">
                        {pipeline.map(({ label, pct, color }) => (
                            <div key={label}>
                                <div className="flex justify-between text-[8px] text-white/40 mb-0.5">
                                    <span>{label}</span><span>{pct}%</span>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full">
                                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Welcome() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openFaq,    setOpenFaq]    = useState(null);
    const [scrolled,   setScrolled]   = useState(false);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const navLinks = [
        { label: 'Features',     href: '#features'     },
        { label: 'How it works', href: '#how-it-works' },
        { label: 'Pricing',      href: '#pricing'      },
        { label: 'FAQ',          href: '#faq'          },
    ];

    return (
        <div className="min-h-screen bg-white font-sans antialiased">

            {/* ── Nav ──────────────────────────────────────────────────────── */}
            <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                 style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <span className={`font-bold text-[17px] tracking-tight ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                                LeadFlow
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map(({ label, href }) => (
                                <a key={label} href={href}
                                   className={`text-sm font-medium transition-colors hover:text-violet-500 ${
                                       scrolled ? 'text-slate-600' : 'text-white/75'
                                   }`}>{label}</a>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center gap-2">
                            <Link href="/login"
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                      scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white/75 hover:text-white hover:bg-white/10'
                                  }`}>
                                Sign In
                            </Link>
                            <Link href="/register"
                                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                                  style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                                Get Started
                            </Link>
                        </div>

                        <button className={`md:hidden p-1.5 ${scrolled ? 'text-slate-700' : 'text-white'}`}
                                onClick={() => setMobileOpen(v => !v)}>
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {mobileOpen && (
                    <div className="md:hidden border-t border-white/10 px-4 py-4 space-y-1"
                         style={{ background: 'rgba(10,8,18,0.97)' }}>
                        {navLinks.map(({ label, href }) => (
                            <a key={label} href={href} onClick={() => setMobileOpen(false)}
                               className="block py-2.5 text-white/75 hover:text-white text-sm font-medium">{label}</a>
                        ))}
                        <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                            <Link href="/login"
                                  className="block py-3 rounded-xl text-center text-sm font-medium text-white/75 border border-white/15 hover:bg-white/5">
                                Sign In
                            </Link>
                            <Link href="/register"
                                  className="block py-3 rounded-xl text-center text-sm font-semibold text-white"
                                  style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                                Get Started
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center overflow-hidden pt-16"
                     style={{ background: 'linear-gradient(155deg, #08060F 0%, #0F0C1E 50%, #130F24 100%)' }}>

                <div className="absolute top-0 right-0 w-[800px] h-[700px] pointer-events-none"
                     style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(124,58,237,0.16) 0%, transparent 60%)', filter: 'blur(60px)' }} />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] pointer-events-none"
                     style={{ background: 'radial-gradient(ellipse at 30% 70%, rgba(79,70,229,0.1) 0%, transparent 60%)', filter: 'blur(80px)' }} />

                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">

                        {/* Left: Copy */}
                        <motion.div variants={stagger} initial="hidden" animate="show">
                            <motion.div variants={fadeUp} className="mb-7">
                                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                                                 text-xs font-semibold text-violet-300
                                                 bg-violet-500/10 border border-violet-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse flex-shrink-0" />
                                    AI lead prospecting is live
                                </span>
                            </motion.div>

                            <motion.h1 variants={fadeUp}
                                       className="text-5xl sm:text-6xl lg:text-7xl font-black text-white
                                                  leading-[0.93] tracking-tight mb-7">
                                Stop losing<br />deals to<br />
                                <span className="bg-clip-text text-transparent"
                                      style={{ backgroundImage: 'linear-gradient(130deg, #C4B5FD 20%, #818CF8 80%)' }}>
                                    spreadsheets.
                                </span>
                            </motion.h1>

                            <motion.p variants={fadeUp}
                                      className="text-white/45 text-lg sm:text-xl leading-relaxed mb-10 max-w-[420px]">
                                LeadFlow puts your leads, emails, pipeline, and invoices
                                in one workspace your whole team can use — starting free.
                            </motion.p>

                            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start gap-3 mb-10">
                                <Link href="/register"
                                      className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base
                                                 font-semibold text-white transition-all
                                                 hover:shadow-2xl hover:shadow-violet-500/25 hover:-translate-y-px"
                                      style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                                    Create Free Account
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                                <Link href="/login"
                                      className="inline-flex items-center gap-1.5 px-7 py-3.5 rounded-xl text-base font-medium
                                                 text-white/50 hover:text-white/90 transition-colors">
                                    Sign in <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                                </Link>
                            </motion.div>

                            <motion.div variants={fadeUp}
                                        className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/30 text-sm">
                                {['Free plan — no card needed', '14-day trial on paid plans', 'Under 2 min to set up'].map(t => (
                                    <span key={t} className="flex items-center gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-green-400/70 flex-shrink-0" />{t}
                                    </span>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Right: App mockup + floating chips */}
                        <div className="relative hidden lg:block">
                            <div className="absolute -inset-8 rounded-3xl pointer-events-none"
                                 style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 65%)', filter: 'blur(40px)' }} />

                            <motion.div
                                initial={{ opacity: 0, y: 44 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.85, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                                style={{ background: '#0F0D1C' }}>
                                <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/70" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/70" />
                                    </div>
                                    <div className="flex-1 flex justify-center">
                                        <div className="bg-white/5 rounded-md px-10 py-1 text-white/20 text-xs">
                                            app.leadflow.io/dashboard
                                        </div>
                                    </div>
                                </div>
                                <div className="flex" style={{ minHeight: '280px' }}>
                                    <MockSidebar />
                                    <MockDashboard />
                                </div>
                            </motion.div>

                            {CHIPS.map(({ icon: Icon, label, sub, iconBg, iconColor, dotBg, pos, floatY, dur, delay }) => (
                                <motion.div
                                    key={label}
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    className={`absolute ${pos}`}>
                                    <motion.div
                                        animate={{ y: [0, floatY, 0] }}
                                        transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.3 }}
                                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 shadow-xl border border-white/10"
                                        style={{ background: 'rgba(15,13,28,0.92)', backdropFilter: 'blur(12px)' }}>
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                             style={{ background: iconBg }}>
                                            <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
                                        </div>
                                        <div>
                                            <div className="text-white text-xs font-semibold leading-tight">{label}</div>
                                            <div className="text-white/35 text-[10px]">{sub}</div>
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotBg }} />
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 inset-x-0 h-28 pointer-events-none"
                     style={{ background: 'linear-gradient(to bottom, transparent, #08060F)' }} />
            </section>

            {/* ── Integration strip ────────────────────────────────────────── */}
            <section className="py-8 border-b border-white/5" style={{ background: '#06050D' }}>
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-10">
                        <span className="text-white/20 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                            Works with
                        </span>
                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
                            {['Gmail', 'Outlook', 'SendGrid', 'Mailgun', 'Brevo', 'Google Sheets', 'CSV Import'].map(name => (
                                <span key={name}
                                      className="text-white/25 text-sm font-medium hover:text-white/50 transition-colors cursor-default">
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats ────────────────────────────────────────────────────── */}
            <section className="py-20" style={{ background: '#06050D' }}>
                <div className="max-w-5xl mx-auto px-4">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '500+',  label: 'Active workspaces', color: '#A78BFA' },
                            { value: '50k+',  label: 'Leads tracked',     color: '#60A5FA' },
                            { value: '99.9%', label: 'Uptime SLA',        color: '#34D399' },
                            { value: '4.9★',  label: 'Average rating',    color: '#FCD34D' },
                        ].map(({ value, label, color }) => (
                            <motion.div key={label} variants={scaleIn}>
                                <div className="text-4xl font-black mb-2" style={{ color }}>{value}</div>
                                <div className="text-white/30 text-sm">{label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Features ─────────────────────────────────────────────────── */}
            <section id="features" className="py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-violet-400" />
                            <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">What's included</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                            Six tools. One tab.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-slate-400 text-lg mt-3 max-w-md">
                            No switching between apps. No copy-pasting between tools.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 rounded-2xl overflow-hidden border border-slate-100">
                        {FEATURES.map(({ icon: Icon, title, description, accent }, idx) => (
                            <motion.div
                                key={title}
                                variants={fadeUp}
                                className="group bg-white p-8 border-r border-b border-slate-100
                                           hover:bg-slate-50/60 transition-colors duration-200 cursor-default
                                           [&:nth-child(3n)]:border-r-0 [&:nth-last-child(-n+3)]:border-b-0">
                                <div className="flex items-start justify-between mb-5">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center
                                                    group-hover:scale-110 transition-transform duration-200"
                                         style={{ background: `${accent}18` }}>
                                        <Icon style={{ color: accent, width: '18px', height: '18px' }} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-200 tabular-nums">
                                        {String(idx + 1).padStart(2, '0')}
                                    </span>
                                </div>
                                <h3 className="text-[15px] font-bold text-slate-900 mb-2">{title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                                <div className="mt-5 h-0.5 w-0 group-hover:w-8 transition-all duration-300 rounded-full"
                                     style={{ background: accent }} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Pipeline highlight ───────────────────────────────────────── */}
            <section className="py-28" style={{ background: '#0A0812' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        <motion.div
                            initial={{ opacity: 0, x: -32 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                            className="rounded-2xl p-5 border border-white/8"
                            style={{ background: 'rgba(15,13,28,0.9)' }}>
                            <div className="text-white/25 text-[10px] font-bold uppercase tracking-widest mb-4">
                                Pipeline Board
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { stage: 'New',      color: '#60A5FA', leads: [{ name: 'Apex Digital', val: 'PKR 240k' }, { name: 'TechNova', val: 'PKR 85k' }, { name: 'BlueByte', val: 'PKR 190k' }] },
                                    { stage: 'In Talk',  color: '#A78BFA', leads: [{ name: 'Orion Labs',   val: 'PKR 320k' }, { name: 'Qlink Corp', val: 'PKR 155k' }] },
                                    { stage: 'Proposal', color: '#FCD34D', leads: [{ name: 'Fivestar Co',  val: 'PKR 90k'  }, { name: 'Cloudify',  val: 'PKR 440k' }] },
                                ].map(({ stage, color, leads }) => (
                                    <div key={stage}>
                                        <div className="text-xs font-bold mb-2" style={{ color }}>
                                            {stage} <span className="text-white/20 font-normal">({leads.length})</span>
                                        </div>
                                        <div className="space-y-2">
                                            {leads.map(({ name, val }) => (
                                                <div key={name}
                                                     className="bg-white/[0.04] rounded-xl p-2.5 border border-white/5">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold"
                                                             style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                                                            {name[0]}
                                                        </div>
                                                        <span className="text-white/65 text-[11px] font-medium truncate">{name}</span>
                                                    </div>
                                                    <div className="text-[11px] font-bold text-green-400">{val}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 32 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="h-px w-10 bg-violet-500" />
                                <span className="text-violet-400 text-xs font-bold uppercase tracking-widest">Pipeline</span>
                            </div>
                            <h2 className="text-4xl font-black text-white mb-5 leading-tight">
                                Know exactly what<br />needs attention today.
                            </h2>
                            <p className="text-white/40 text-lg mb-8 leading-relaxed">
                                The Kanban board shows every deal in your pipeline. Drag a card to update its stage.
                                Click it to see the full history — calls, emails, notes — without opening a separate screen.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    'Custom stages that match your sales process',
                                    'Priority and score per lead',
                                    'Bulk moves across stages',
                                    'Full activity log on every card',
                                    'Filter by tag, owner, or status in seconds',
                                ].map(item => (
                                    <li key={item} className="flex items-center gap-3 text-white/50 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />{item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Campaign highlight ───────────────────────────────────────── */}
            <section className="py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        <motion.div
                            initial={{ opacity: 0, x: -32 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="h-px w-10 bg-blue-400" />
                                <span className="text-blue-600 text-xs font-bold uppercase tracking-widest">Email Campaigns</span>
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 mb-5 leading-tight">
                                See who read your email<br />before you follow up.
                            </h2>
                            <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                                Send a campaign to a segment of your leads and track opens and clicks per person.
                                Know exactly who's warm so you reach out at the right moment.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    'Works with Gmail, Outlook, SendGrid, any SMTP',
                                    'Open & click tracking per contact',
                                    'Personalise with name, company, custom fields',
                                    'Schedule sends or throttle by hour',
                                    'Per-contact delivery log',
                                ].map(item => (
                                    <li key={item} className="flex items-center gap-3 text-slate-600 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />{item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 32 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                            className="rounded-2xl overflow-hidden border border-slate-100 shadow-lg">
                            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                                <div className="text-slate-800 font-semibold text-sm">Q4 Outreach — Batch 1</div>
                                <div className="text-slate-400 text-xs mt-0.5">847 recipients · running for 2 days</div>
                            </div>
                            <div className="bg-white p-4">
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {[
                                        { label: 'Delivered', value: '847', sub: '100%',  color: '#059669', bg: '#ECFDF5' },
                                        { label: 'Opened',    value: '412', sub: '48.7%', color: '#2563EB', bg: '#EFF6FF' },
                                        { label: 'Clicked',   value: '89',  sub: '10.5%', color: '#7C3AED', bg: '#F5F3FF' },
                                        { label: 'Replied',   value: '24',  sub: '2.8%',  color: '#D97706', bg: '#FFFBEB' },
                                    ].map(({ label, value, sub, color, bg }) => (
                                        <div key={label} className="rounded-xl p-3 border border-slate-100" style={{ background: bg }}>
                                            <div className="text-slate-500 text-xs mb-1">{label}</div>
                                            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
                                            <div className="text-xs opacity-70" style={{ color }}>{sub}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-slate-400 text-[10px] mb-2">Sends per hour (last 48 h)</div>
                                <div className="flex items-end gap-1" style={{ height: '44px' }}>
                                    {[20,80,100,60,40,75,90,50,30,85,70,95].map((h, i) => (
                                        <div key={i} className="flex-1 rounded-sm"
                                             style={{ height: `${h}%`, background: 'linear-gradient(180deg,#3B82F6,#6366F1)', opacity: 0.65 }} />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── How it works ─────────────────────────────────────────────── */}
            <section id="how-it-works" className="py-28" style={{ background: '#F7F6FE' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-violet-400" />
                            <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">Getting started</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                            Three steps.<br />
                            <span className="text-slate-400 font-normal text-4xl sm:text-4xl">You're working.</span>
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-slate-500 text-lg mt-3 max-w-md">
                            No demo calls, no lengthy onboarding. Sign up and you're running in minutes.
                        </motion.p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {STEPS.map(({ num, icon: Icon, title, description }, i) => (
                            <motion.div
                                key={title}
                                initial={{ opacity: 0, y: 32 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                                className="relative bg-white rounded-2xl p-8 border border-slate-100 shadow-sm overflow-hidden">
                                <div className="absolute top-4 right-5 text-[56px] font-black text-slate-100 leading-none select-none">
                                    {num}
                                </div>
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                                         style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ─────────────────────────────────────────────── */}
            <section className="py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-violet-400" />
                            <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">What people say</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                            From teams that<br />actually use it.
                        </motion.h2>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <motion.div
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            className="rounded-2xl p-8 lg:p-10 flex flex-col justify-between"
                            style={{ background: 'linear-gradient(150deg,#0D0B18,#1A1232)' }}>
                            <div>
                                <div className="flex gap-1 mb-6">
                                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                                </div>
                                <blockquote className="text-white/75 text-xl leading-relaxed font-light">
                                    "{TESTIMONIALS[1].text}"
                                </blockquote>
                            </div>
                            <div className="flex items-center gap-3 pt-8 mt-8 border-t border-white/10">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                     style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                                    {TESTIMONIALS[1].avatar}
                                </div>
                                <div>
                                    <div className="text-white font-semibold text-sm">{TESTIMONIALS[1].name}</div>
                                    <div className="text-white/35 text-xs">{TESTIMONIALS[1].role}</div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="flex flex-col gap-5">
                            {[TESTIMONIALS[0], TESTIMONIALS[2]].map(({ name, role, avatar, text, rating }, i) => (
                                <motion.div
                                    key={name}
                                    initial={{ opacity: 0, y: 28 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.55, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                    className="flex-1 rounded-2xl p-7 bg-slate-50 border border-slate-100">
                                    <div className="flex gap-1 mb-4">
                                        {Array.from({ length: rating }).map((_, j) => (
                                            <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                        ))}
                                    </div>
                                    <blockquote className="text-slate-700 leading-relaxed mb-5 text-sm">"{text}"</blockquote>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                             style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                                            {avatar}
                                        </div>
                                        <div>
                                            <div className="text-slate-900 font-semibold text-sm">{name}</div>
                                            <div className="text-slate-400 text-xs">{role}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-10 flex items-center justify-center gap-3">
                        <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                        </div>
                        <span className="text-slate-700 font-semibold text-sm">4.9 out of 5</span>
                        <span className="text-slate-400 text-sm">· 200+ reviews</span>
                    </div>
                </div>
            </section>

            {/* ── Pricing ──────────────────────────────────────────────────── */}
            <section id="pricing" className="py-28" style={{ background: '#0A0812' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-3 mb-5">
                            <div className="h-px w-10 bg-violet-500" />
                            <span className="text-violet-400 text-xs font-bold uppercase tracking-widest">Pricing</span>
                            <div className="h-px w-10 bg-violet-500" />
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
                            Simple, honest pricing.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-white/35 text-lg max-w-md mx-auto">
                            Start free. Upgrade when it makes sense. No long contracts.
                        </motion.p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
                        {PRICING.map(({ name, price, period, description, features, cta, ctaHref, highlight }, i) => (
                            <motion.div
                                key={name}
                                initial={{ opacity: 0, y: 32 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                className={`rounded-2xl p-7 flex flex-col relative ${
                                    highlight ? 'border-2 border-violet-500' : 'border border-white/8'
                                }`}
                                style={highlight
                                    ? { background: 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(79,70,229,0.08))' }
                                    : { background: 'rgba(255,255,255,0.025)' }}>

                                {highlight && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full
                                                    text-xs font-bold text-white whitespace-nowrap"
                                         style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-6">
                                    <div className="text-white font-bold text-xl mb-2">{name}</div>
                                    <div className="text-3xl font-extrabold text-white mb-0.5">{price}</div>
                                    {period && <div className="text-white/25 text-xs mb-3">{period}</div>}
                                    <p className="text-white/35 text-sm">{description}</p>
                                </div>

                                <ul className="space-y-2.5 mb-8 flex-1">
                                    {features.map(f => (
                                        <li key={f} className="flex items-start gap-2.5 text-white/50 text-sm">
                                            <Check className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />{f}
                                        </li>
                                    ))}
                                </ul>

                                <Link href={ctaHref}
                                      className={`w-full py-3 rounded-xl text-center text-sm font-semibold transition-all ${
                                          highlight
                                              ? 'text-white hover:opacity-90'
                                              : 'text-white/50 border border-white/12 hover:bg-white/5 hover:text-white'
                                      }`}
                                      style={highlight ? { background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' } : {}}>
                                    {cta}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                    <p className="text-center text-white/20 text-sm mt-8">
                        Prices in PKR. All paid plans include a 14-day trial — no card needed.
                    </p>
                </div>
            </section>

            {/* ── FAQ ──────────────────────────────────────────────────────── */}
            <section id="faq" className="py-28 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-violet-400" />
                            <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">FAQ</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-slate-900 mb-4">
                            Questions.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-slate-500 text-lg">
                            Still unsure?{' '}
                            <a href="mailto:hello@lumenialab.com" className="text-violet-600 hover:underline font-medium">
                                Email us directly.
                            </a>
                        </motion.p>
                    </motion.div>

                    <div className="space-y-2">
                        {FAQS.map(({ q, a }, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.04 }}
                                className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full flex items-center justify-between px-6 py-5 text-left gap-4
                                               hover:bg-slate-50 transition-colors">
                                    <span className="text-slate-900 font-semibold text-sm sm:text-base">{q}</span>
                                    <motion.span
                                        animate={{ rotate: openFaq === idx ? 180 : 0 }}
                                        transition={{ duration: 0.22 }}
                                        className="flex-shrink-0">
                                        <ChevronDown className="w-5 h-5 text-violet-500" />
                                    </motion.span>
                                </button>
                                <AnimatePresence initial={false}>
                                    {openFaq === idx && (
                                        <motion.div
                                            key="body"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.24, ease: 'easeInOut' }}>
                                            <div className="px-6 pb-6 border-t border-slate-50">
                                                <p className="pt-4 text-slate-500 leading-relaxed text-sm">{a}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Final CTA ────────────────────────────────────────────────── */}
            <section className="py-32 relative overflow-hidden"
                     style={{ background: 'linear-gradient(155deg,#08060F 0%,#130F24 100%)' }}>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[700px] h-[500px] rounded-full"
                         style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 65%)', filter: 'blur(60px)' }} />
                </div>

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="relative z-10 max-w-2xl mx-auto px-4 text-center">
                    <motion.h2 variants={fadeUp}
                               className="text-4xl sm:text-6xl font-black text-white mb-5 leading-tight">
                        Give it a try.<br />
                        <span className="text-white/30 font-light text-3xl sm:text-5xl">It's free to start.</span>
                    </motion.h2>
                    <motion.p variants={fadeUp} className="text-white/40 text-lg mb-10">
                        Create your workspace in two minutes and see if it fits how you work.
                        No card, no contract.
                    </motion.p>
                    <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register"
                              className="group flex items-center justify-center gap-2 px-10 py-4 rounded-xl text-base
                                         font-semibold text-white transition-all hover:opacity-90
                                         hover:shadow-2xl hover:shadow-violet-500/30 hover:-translate-y-0.5"
                              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                            Create Free Account
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <Link href="/login"
                              className="px-10 py-4 rounded-xl text-base font-semibold text-white/45
                                         border border-white/12 hover:bg-white/5 hover:text-white transition-all">
                            Sign In
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* ── Footer ───────────────────────────────────────────────────── */}
            <footer style={{ background: '#030208' }} className="border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                     style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                                    <Zap className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-white text-[17px]">LeadFlow</span>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                A CRM for sales teams that actually want to use their CRM. By Lumenia Lab.
                            </p>
                        </div>

                        {[
                            { heading: 'Product', links: [{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }, { label: 'FAQ', href: '#faq' }, { label: 'Changelog', href: '#' }] },
                            { heading: 'Account', links: [{ label: 'Sign In', href: '/login', internal: true }, { label: 'Register', href: '/register', internal: true }, { label: 'Support', href: '#' }, { label: 'Contact', href: '#' }] },
                            { heading: 'Legal',   links: [{ label: 'Privacy Policy', href: '#' }, { label: 'Terms of Service', href: '#' }, { label: 'Security', href: '#' }] },
                        ].map(({ heading, links }) => (
                            <div key={heading}>
                                <div className="text-white font-semibold text-sm mb-4">{heading}</div>
                                <ul className="space-y-2.5">
                                    {links.map(({ label, href, internal }) => (
                                        <li key={label}>
                                            {internal ? (
                                                <Link href={href} className="text-slate-600 hover:text-white text-sm transition-colors">{label}</Link>
                                            ) : (
                                                <a href={href} className="text-slate-600 hover:text-white text-sm transition-colors">{label}</a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-slate-700 text-sm">
                            © {new Date().getFullYear()} Lumenia Lab. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-slate-700 hover:text-white text-sm transition-colors">Twitter / X</a>
                            <a href="#" className="text-slate-700 hover:text-white text-sm transition-colors">LinkedIn</a>
                            <a href="mailto:hello@lumenialab.com"
                               className="text-slate-700 hover:text-white text-sm transition-colors">
                                hello@lumenialab.com
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
