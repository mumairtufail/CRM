import { useState, useEffect, useRef } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Mail, FileText, Briefcase,
    Check, ChevronDown, Star, Target,
    TrendingUp, Menu, X, Building2,
    Cpu, LayoutDashboard, CheckCircle2,
    Upload, ArrowRight, Bell, MessageSquare,
    Phone, Send, MapPin,
    MailOpen, Sparkles, Clock, AlertCircle, Activity,
} from 'lucide-react';
import { LogoMark } from '@/Components/Common/Logo';

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
    { name: 'Bilal Akhtar',   role: 'Head of Sales',   avatar: 'BA', rating: 5, text: "We had leads in five WhatsApp groups and a shared spreadsheet nobody could agree on. Now everything's in one place and our follow-up rate actually went up." },
    { name: 'Sarah Mitchell', role: 'Founder',          avatar: 'SM', rating: 5, text: "The email tracking sold me. Ahmed opened my proposal email three times yesterday — so I called him this morning. Closed the deal before lunch." },
    { name: 'Kamran Yousaf',  role: 'CEO',              avatar: 'KY', rating: 5, text: "We run three client accounts from one platform using different workspaces. Each team only sees their own data. It just works the way you'd expect it to." },
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

const TIMELINE_EVENTS = [
    { icon: Sparkles,     color: '#7C3AED', title: 'Lead found via AI prospecting',         sub: 'Apollo.io · "SaaS founders, Pakistan, <50 employees" · ICP score 94',      time: '14d ago' },
    { icon: Mail,         color: '#3B82F6', title: 'Campaign email sent',                   sub: 'Q4 Outreach — Batch 1 · Personalised subject & first line',                time: '13d ago' },
    { icon: MailOpen,     color: '#60A5FA', title: 'Email opened ×3 — pricing link clicked', sub: 'High-intent signal → moved to stage: Interested',                          time: '12d ago', hot: true },
    { icon: Send,         color: '#8B5CF6', title: 'Auto follow-up sent',                   sub: 'Triggered: no reply in 48 h · Sequence Rule #2',                            time: '10d ago' },
    { icon: Phone,        color: '#10B981', title: 'Call logged · Bilal Akhtar',            sub: '"Very interested — wants a live demo next week"',                           time: '9d ago'  },
    { icon: FileText,     color: '#F59E0B', title: 'Proposal sent · PKR 240,000 / mo',      sub: '3 seats · Pro plan · PDF generated via LeadFlow',                          time: '7d ago'  },
    { icon: CheckCircle2, color: '#10B981', title: 'Invoice paid — Deal Won ✓',             sub: 'INV-041 · PKR 240,000 · Received in full',                                  time: '2d ago', won: true },
];

const AUTO_RULES = [
    { trigger: 'No reply in 48 hours',     action: 'Auto-send a follow-up email',     icon: Clock,       color: '#3B82F6', bg: '#EFF6FF' },
    { trigger: 'Email opened 3+ times',    action: 'Alert the assigned rep instantly', icon: Activity,    color: '#7C3AED', bg: '#F5F3FF' },
    { trigger: 'Pricing link clicked',     action: 'Move lead to "Hot" stage',        icon: TrendingUp,  color: '#10B981', bg: '#ECFDF5' },
    { trigger: 'Deal stalled 7+ days',     action: 'Send a nudge reminder',           icon: AlertCircle, color: '#F59E0B', bg: '#FFFBEB' },
];

const BUSINESS_TYPES = [
    {
        type: 'Agencies',
        icon: Building2,
        color: '#7C3AED',
        bg: 'rgba(124,58,237,0.05)',
        border: 'rgba(124,58,237,0.15)',
        headline: 'Run every client from one platform.',
        copy: 'Separate workspaces per client. Each team sees only their data. You get the full picture in one superadmin view — no shared spreadsheets.',
        stat: '12 clients', statSub: 'managed without a single shared spreadsheet',
    },
    {
        type: 'Sales Teams',
        icon: Target,
        color: '#3B82F6',
        bg: 'rgba(59,130,246,0.05)',
        border: 'rgba(59,130,246,0.15)',
        headline: 'Stop letting warm leads go cold.',
        copy: 'Auto follow-up rules, shared timelines, and a full activity log per lead so nothing falls through between reps — even when someone is OOO.',
        stat: '2× faster', statSub: 'pipeline velocity — reported by our users',
    },
    {
        type: 'Freelancers',
        icon: Users,
        color: '#10B981',
        bg: 'rgba(16,185,129,0.05)',
        border: 'rgba(16,185,129,0.15)',
        headline: 'First contact to paid invoice, same tab.',
        copy: 'Capture a lead, run a campaign, close the deal, and send the invoice without leaving LeadFlow or repeating yourself across four different tools.',
        stat: '4 h / week', statSub: 'saved on admin, chasing, and copy-pasting',
    },
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
                <LogoMark size={18} />
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
    const [contactSent, setContactSent] = useState(false);

    const contact = useForm({
        name: '', email: '', company: '', phone: '', subject: '', message: '',
    });

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const navLinks = [
        { label: 'Features',       href: '#features'      },
        { label: 'AI Prospecting', href: '#integrations'  },
        { label: 'How it works',   href: '#how-it-works'  },
        { label: 'Pricing',        href: '#pricing'       },
        { label: 'Contact',        href: '#contact'       },
    ];

    const submitContact = (e) => {
        e.preventDefault()
        contact.post('/contact', {
            preserveScroll: true,
            onSuccess: () => { setContactSent(true); contact.reset() },
        })
    };

    return (
        <div className="min-h-screen bg-white font-sans antialiased">

            {/* ── Nav ──────────────────────────────────────────────────────── */}
            <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2.5">
                            <LogoMark size={34} />
                            <span className={`font-extrabold text-[17px] tracking-tight leading-none ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                                Lumenia CRM
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
                                {/* <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                                                 text-xs font-semibold text-violet-300
                                                 bg-violet-500/10 border border-violet-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse flex-shrink-0" />
                                    AI lead prospecting is live
                                </span> */}
                            </motion.div>

                            <motion.h1 variants={fadeUp}
                                       className="text-5xl sm:text-6xl lg:text-7xl font-black text-white
                                        Under 2 min to set up          leading-[0.93] tracking-tight mb-7">
                                Stop losing<br />deals to<br />
                                <span className="bg-clip-text text-transparent"
                                      style={{ backgroundImage: 'linear-gradient(130deg, #C4B5FD 20%, #818CF8 80%)' }}>
                                    spreadsheets.
                                </span>
                            </motion.h1>

                            <motion.p variants={fadeUp}
                                      className="text-white/45 text-lg sm:text-xl leading-relaxed mb-10 max-w-[420px]">
                                Lumenia CRM puts your leads, emails, pipeline, and invoices
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
                                {/* {['Free plan — no card needed', '14-day trial on paid plans', 'Under 2 min to set up'].map(t => (
                                    <span key={t} className="flex items-center gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-green-400/70 flex-shrink-0" />{t}
                                    </span>
                                ))} */}
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
                                            app.lumeniacrm.com/dashboard
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

            {/* ── AI Data Partners ──────────────────────────────────────────── */}
            <section id="integrations" className="py-28" style={{ background: '#07050F' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">

                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-14">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10" style={{ background: '#FB923C' }} />
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#FB923C' }}>AI Prospecting</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
                            Find anyone. Import instantly.<br />
                            <span className="text-white/25 font-light text-3xl sm:text-4xl">Powered by the world's best data.</span>
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-white/40 text-lg max-w-2xl">
                            Describe your ideal customer in plain English. LeadFlow queries{' '}
                            <span className="font-semibold" style={{ color: '#FB923C' }}>Apollo.io</span> and{' '}
                            <span className="text-blue-400 font-semibold">People Data Labs</span>{' '}
                            simultaneously, ranks results by ICP match score, and imports verified leads straight into your workspace.
                        </motion.p>
                    </motion.div>

                    {/* Bento grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                        {/* Apollo.io card */}
                        <motion.div
                            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.55 }}
                            className="md:col-span-5 rounded-3xl p-7 border border-white/[0.06] relative overflow-hidden"
                            style={{ background: 'rgba(255,107,61,0.04)' }}
                        >
                            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
                                 style={{ background: 'radial-gradient(circle, rgba(255,107,61,0.12) 0%, transparent 65%)' }} />
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0"
                                     style={{ background: 'linear-gradient(135deg,#FF6B3D,#E63900)' }}>A</div>
                                <div>
                                    <div className="text-white font-bold text-sm">Apollo.io</div>
                                    <div className="text-white/30 text-xs">Sales Intelligence Platform</div>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
                                     style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.3)' }}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-green-400 text-[10px] font-bold">Live</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {[{ n:'275M+',l:'Verified contacts'},{n:'73M+',l:'Companies indexed'},{n:'98%',l:'Email accuracy'},{n:'< 1s',l:'Query response'}].map(({n,l})=>(
                                    <div key={l} className="rounded-2xl p-4 border border-white/[0.05]" style={{ background:'rgba(255,255,255,0.025)' }}>
                                        <div className="text-[22px] font-black text-white leading-none mb-1">{n}</div>
                                        <div className="text-white/25 text-[11px]">{l}</div>
                                    </div>
                                ))}
                            </div>
                            <ul className="space-y-2">
                                {['Verified work emails','Direct phone numbers','LinkedIn URL + seniority','Tech stack & funding data','Company headcount + growth'].map(item=>(
                                    <li key={item} className="flex items-center gap-2.5 text-white/45 text-sm">
                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color:'#FB923C' }}/>{item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Connector bridge */}
                        <div className="hidden md:flex md:col-span-2 flex-col items-center justify-center gap-3">
                            <div className="flex-1 w-px" style={{ background: 'linear-gradient(180deg,transparent,rgba(255,255,255,0.06))' }} />
                            <div className="w-12 h-12 rounded-full border flex items-center justify-center shrink-0"
                                 style={{ background: 'rgba(124,58,237,0.15)', borderColor: 'rgba(124,58,237,0.35)' }}>
                                <Sparkles size={15} className="text-violet-400" />
                            </div>
                            <div className="flex-1 w-px" style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.06),transparent)' }} />
                        </div>

                        {/* People Data Labs card */}
                        <motion.div
                            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.08 }}
                            className="md:col-span-5 rounded-3xl p-7 border border-white/[0.06] relative overflow-hidden"
                            style={{ background: 'rgba(59,130,246,0.04)' }}
                        >
                            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full pointer-events-none"
                                 style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 65%)' }} />
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-[10px] shrink-0"
                                     style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>PDL</div>
                                <div>
                                    <div className="text-white font-bold text-sm">People Data Labs</div>
                                    <div className="text-white/30 text-xs">Enterprise Data API</div>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
                                     style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.3)' }}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-green-400 text-[10px] font-bold">Live</span>
                                </div>
                            </div>
                            <div className="space-y-0 mb-6 divide-y" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                                {[{n:'1.5B+',l:'Person profiles globally',c:'#60A5FA'},{n:'420M+',l:'Professional B2B records',c:'#818CF8'},{n:'180+',l:'Countries covered',c:'#34D399'}].map(({n,l,c})=>(
                                    <div key={l} className="flex items-center justify-between py-3.5">
                                        <span className="text-white/35 text-sm">{l}</span>
                                        <span className="font-black text-xl leading-none" style={{ color:c }}>{n}</span>
                                    </div>
                                ))}
                            </div>
                            <ul className="space-y-2">
                                {['Work & personal emails','Job history & seniority','Skills, education & certs','Social profiles (LinkedIn, GitHub)','Real-time job change signals'].map(item=>(
                                    <li key={item} className="flex items-center gap-2.5 text-white/45 text-sm">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0"/>{item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Combined stat */}
                        <motion.div
                            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.12 }}
                            className="md:col-span-4 rounded-3xl p-8 flex flex-col justify-between border"
                            style={{ background:'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(79,70,229,0.05))', borderColor:'rgba(124,58,237,0.2)' }}
                        >
                            <div>
                                <div className="text-[54px] font-black text-white leading-none mb-2">
                                    350M<span className="text-violet-400">+</span>
                                </div>
                                <div className="text-white/30 text-sm leading-relaxed">
                                    reachable contacts across both networks — deduplicated, ranked by ICP fit
                                </div>
                            </div>
                            <div className="space-y-3 pt-6 mt-6 border-t border-white/[0.07]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background:'#FF6B3D' }} />
                                    <span className="text-white/30 text-xs">Apollo.io · 275M contacts</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background:'#3B82F6' }} />
                                    <span className="text-white/30 text-xs">People Data Labs · 1.5B profiles</span>
                                </div>
                                <div className="flex items-center gap-2.5 pt-3 border-t border-white/[0.05]">
                                    <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                                    <span className="text-violet-300 text-xs font-semibold">AI-ranked by ICP match score</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* AI query demo */}
                        <motion.div
                            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.16 }}
                            className="md:col-span-8 rounded-3xl p-7 border border-white/[0.06]"
                            style={{ background:'rgba(255,255,255,0.02)' }}
                        >
                            <div className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-4">AI Lead Search — Live</div>

                            {/* Natural-language query */}
                            <div className="rounded-xl border px-4 py-3.5 mb-4"
                                 style={{ background:'rgba(124,58,237,0.07)', borderColor:'rgba(124,58,237,0.3)' }}>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Sparkles size={11} className="text-violet-400 shrink-0" />
                                    <span className="text-violet-400 text-[9px] font-black uppercase tracking-widest">Natural-language query</span>
                                </div>
                                <p className="text-white/55 text-sm leading-relaxed italic">
                                    "Find <span className="text-violet-300 not-italic font-semibold">SaaS founders</span> in{' '}
                                    <span className="text-violet-300 not-italic font-semibold">Pakistan</span> with companies{' '}
                                    <span className="text-violet-300 not-italic font-semibold">under 50 employees</span> using{' '}
                                    <span className="text-violet-300 not-italic font-semibold">HubSpot or Salesforce</span>"
                                </p>
                            </div>

                            <div className="flex items-center gap-2 mb-4 text-white/20 text-xs">
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                                Querying Apollo.io + People Data Labs · 247 matches found
                            </div>

                            {/* Result rows */}
                            <div className="space-y-2">
                                {[
                                    { name:'Ahmed Karim',   title:'Co-founder & CEO', company:'Techstars PK',  email:'a.k***@techstars.pk',  score:94, src:'Apollo' },
                                    { name:'Sara Qureshi',  title:'Founder',          company:'Cloudify.io',   email:'s.q***@cloudify.io',   score:89, src:'PDL'    },
                                    { name:'Omar Siddiqui', title:'CEO',              company:'Nexara Pvt',    email:'o.s***@nexara.pk',      score:83, src:'Apollo' },
                                ].map(({ name, title, company, email, score, src }) => (
                                    <div key={name}
                                         className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/[0.05]"
                                         style={{ background:'rgba(255,255,255,0.03)' }}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                                             style={{ background:'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                                            {name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-white/75 text-sm font-semibold truncate">{name}</div>
                                            <div className="text-white/25 text-xs truncate">{title} · {company}</div>
                                        </div>
                                        <div className="hidden sm:block text-white/20 text-xs shrink-0">{email}</div>
                                        <div className="shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full border"
                                             style={{ color:src==='Apollo'?'#FB923C':'#60A5FA', borderColor:src==='Apollo'?'rgba(251,146,60,0.3)':'rgba(96,165,250,0.3)', background:src==='Apollo'?'rgba(251,146,60,0.08)':'rgba(96,165,250,0.08)' }}>
                                            {src}
                                        </div>
                                        <div className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-black"
                                             style={{ background:score>=90?'rgba(16,185,129,0.12)':'rgba(59,130,246,0.1)', color:score>=90?'#10B981':'#60A5FA' }}>
                                            {score}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between gap-4">
                                <span className="text-white/20 text-xs">244 more results · importing to workspace</span>
                                <div className="w-32 h-1.5 rounded-full bg-white/[0.06] overflow-hidden shrink-0">
                                    <div className="h-full w-3/4 rounded-full" style={{ background:'linear-gradient(90deg,#7C3AED,#4F46E5)' }} />
                                </div>
                            </div>
                        </motion.div>

                    </div>
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

            {/* ── Lead History Timeline ────────────────────────────────────── */}
            <section className="py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                        {/* ── Left: text ── */}
                        <motion.div
                            initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}
                            className="lg:sticky lg:top-24"
                        >
                            <div className="flex items-center gap-3 mb-5">
                                <div className="h-px w-10 bg-violet-400" />
                                <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">Lead History</span>
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-5">
                                Every touchpoint.<br />Forever on record.
                            </h2>
                            <p className="text-slate-500 text-lg leading-relaxed mb-8">
                                From the moment AI finds a lead to the day the invoice is paid,
                                every email, call, note, and stage change is timestamped and
                                searchable — attached to the lead, not scattered across your inbox.
                            </p>
                            <ul className="space-y-3 mb-10">
                                {[
                                    'AI import source + ICP score logged automatically',
                                    'Campaign sends and per-contact open/click tracking',
                                    'Auto and manual follow-up history in one thread',
                                    'Call logs with rep notes and timestamps',
                                    'Pipeline stage changes with who moved it and when',
                                    'Proposal, invoice, and payment events all visible',
                                ].map(item => (
                                    <li key={item} className="flex items-center gap-3 text-slate-600 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />{item}
                                    </li>
                                ))}
                            </ul>
                            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700 text-sm font-semibold">
                                <Activity className="w-4 h-4" />
                                Full history. No gaps. No surprises.
                            </div>
                        </motion.div>

                        {/* ── Right: timeline mockup ── */}
                        <motion.div
                            initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.08, ease: [0.22,1,0.36,1] }}
                            className="rounded-2xl overflow-hidden border border-white/[0.07] shadow-2xl"
                            style={{ background:'#0D0B18' }}
                        >
                            {/* Lead header */}
                            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                         style={{ background:'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>A</div>
                                    <div>
                                        <div className="text-white font-semibold text-[13px] leading-none">Ali Hassan — Apex Digital</div>
                                        <div className="text-white/25 text-[10px] mt-0.5">SaaS Founder · Lahore, PK · ICP score 94</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                                     style={{ background:'rgba(16,185,129,0.1)', color:'#10B981' }}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />Won
                                </div>
                            </div>

                            {/* Events */}
                            <div className="px-5 pt-5 pb-4">
                                {TIMELINE_EVENTS.map(({ icon: Icon, color, title, sub, time, hot, won }, i) => (
                                    <div key={i} className="flex gap-3 relative">
                                        {i < TIMELINE_EVENTS.length - 1 && (
                                            <div className="absolute left-[15px] top-9 bottom-0 w-px"
                                                 style={{ background:'rgba(255,255,255,0.05)' }} />
                                        )}
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10"
                                             style={{ background:`${color}18` }}>
                                            <Icon className="w-4 h-4" style={{ color }} />
                                        </div>
                                        <div className={`flex-1 ${i < TIMELINE_EVENTS.length - 1 ? 'pb-5' : 'pb-1'}`}>
                                            <div className="flex items-start justify-between gap-2">
                                                <span className={`font-semibold text-[13px] leading-snug ${won?'text-green-400':hot?'text-blue-300':'text-white/70'}`}>
                                                    {title}
                                                </span>
                                                <span className="text-white/20 text-[11px] shrink-0 mt-0.5">{time}</span>
                                            </div>
                                            <p className="text-white/25 text-[11px] mt-0.5 leading-relaxed">{sub}</p>
                                            {hot && (
                                                <span className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                                                      style={{ background:'rgba(59,130,246,0.15)', color:'#60A5FA' }}>
                                                    ↑ High intent signal
                                                </span>
                                            )}
                                            {won && (
                                                <span className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                                                      style={{ background:'rgba(16,185,129,0.15)', color:'#10B981' }}>
                                                    ✓ Deal closed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
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

            {/* ── Automation + Business Impact ──────────────────────────────── */}
            <section className="py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">

                    {/* Automation rules header */}
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-14">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-violet-400" />
                            <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">Automation</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-3">
                            Your follow-up never drops.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-slate-500 text-lg max-w-xl">
                            Set the rules once. LeadFlow works the pipeline automatically — so every lead
                            gets the right action at the right time, without you thinking about it.
                        </motion.p>
                    </motion.div>

                    {/* IF → THEN rule cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-24">
                        {AUTO_RULES.map(({ trigger, action, icon: Icon, color, bg }, i) => (
                            <motion.div
                                key={trigger}
                                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }}
                                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200"
                            >
                                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5" style={{ background: bg }}>
                                    <Icon className="w-5 h-5" style={{ color }} />
                                </div>
                                <div className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-300 mb-1.5">If</div>
                                <div className="text-slate-900 font-bold text-sm leading-snug mb-4">{trigger}</div>
                                <div className="h-px bg-slate-100 mb-4" />
                                <div className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-300 mb-1.5">Then</div>
                                <div className="font-semibold text-sm leading-snug" style={{ color }}>{action}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Who it's for */}
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-slate-200" />
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Who it's for</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                            Built for the way you actually sell.
                        </motion.h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {BUSINESS_TYPES.map(({ type, icon: Icon, color, bg, border, headline, copy, stat, statSub }, i) => (
                            <motion.div
                                key={type}
                                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="rounded-2xl p-8 border"
                                style={{ background: bg, borderColor: border }}
                            >
                                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5 bg-white shadow-sm">
                                    <Icon className="w-5 h-5" style={{ color }} />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color }}>{type}</div>
                                <h3 className="text-slate-900 font-black text-lg leading-snug mb-3">{headline}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-7">{copy}</p>
                                <div className="pt-5 border-t" style={{ borderColor: border }}>
                                    <div className="text-2xl font-black leading-none mb-0.5" style={{ color }}>{stat}</div>
                                    <div className="text-slate-400 text-xs">{statSub}</div>
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
                <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-3 mb-5">
                            <div className="h-px w-10 bg-violet-500" />
                            <span className="text-violet-400 text-xs font-bold uppercase tracking-widest">Pricing</span>
                            <div className="h-px w-10 bg-violet-500" />
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
                            Pricing that fits<br />your team.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-white/40 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                            We tailor plans to the size and needs of your team.
                            Reach out and we'll walk you through the options — or just sign up free and explore it yourself.
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="#contact"
                               className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base
                                          font-semibold text-white transition-all hover:opacity-90
                                          hover:shadow-2xl hover:shadow-violet-500/25 hover:-translate-y-px"
                               style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                                Contact us for pricing
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </a>
                            <Link href="/register"
                                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base
                                             font-semibold text-white/60 border border-white/12
                                             hover:bg-white/5 hover:text-white transition-all">
                                Register free to explore
                            </Link>
                        </motion.div>

                        <motion.div variants={fadeUp} className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
                            {[
                                { label: 'Free forever', desc: 'Get started with no credit card. Explore every feature at your own pace.' },
                                { label: 'Flexible plans', desc: 'Pay only for what your team needs. No bloated bundles.' },
                                { label: 'No long contracts', desc: 'Monthly or annual billing. Cancel any time without hassle.' },
                            ].map(({ label, desc }) => (
                                <div key={label}
                                     className="rounded-2xl p-6 border border-white/8"
                                     style={{ background: 'rgba(255,255,255,0.025)' }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
                                         style={{ background: 'rgba(124,58,237,0.18)' }}>
                                        <Check className="w-4 h-4 text-violet-400" />
                                    </div>
                                    <div className="text-white font-bold text-sm mb-1.5">{label}</div>
                                    <div className="text-white/35 text-sm leading-relaxed">{desc}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
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

            {/* ── Contact Us ───────────────────────────────────────────────── */}
            <section id="contact" className="py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">

                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-14">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-violet-400" />
                            <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">Get in touch</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
                            Let's talk.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-slate-500 text-lg max-w-lg">
                            Have a question, need a demo, or want to discuss a custom plan?
                            Drop us a message and we'll get back to you within one business day.
                        </motion.p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

                        {/* Contact info */}
                        <motion.div
                            initial={{ opacity: 0, x: -24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            className="lg:col-span-2 space-y-8">

                            {[
                                {
                                    icon: Mail,
                                    title: 'Email us',
                                    value: 'hello@lumenialab.com',
                                    sub: 'We reply within 24 hours',
                                    color: '#7C3AED',
                                    bg: '#F5F3FF',
                                },
                                {
                                    icon: MessageSquare,
                                    title: 'Live chat',
                                    value: 'Available in-app',
                                    sub: 'Mon–Fri, 9 am – 6 pm PKT',
                                    color: '#2563EB',
                                    bg: '#EFF6FF',
                                },
                                {
                                    icon: Phone,
                                    title: 'Call us',
                                    value: '+92 300 000 0000',
                                    sub: 'Business hours only',
                                    color: '#059669',
                                    bg: '#ECFDF5',
                                },
                                {
                                    icon: MapPin,
                                    title: 'Headquarters',
                                    value: 'Lahore, Pakistan',
                                    sub: 'Lumenia Lab Pvt. Ltd.',
                                    color: '#D97706',
                                    bg: '#FFFBEB',
                                },
                            ].map(({ icon: Icon, title, value, sub, color, bg }) => (
                                <div key={title} className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                                         style={{ background: bg }}>
                                        <Icon className="w-5 h-5" style={{ color }} />
                                    </div>
                                    <div>
                                        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">{title}</div>
                                        <div className="text-slate-900 font-semibold text-sm">{value}</div>
                                        <div className="text-slate-400 text-xs mt-0.5">{sub}</div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Contact form */}
                        <motion.div
                            initial={{ opacity: 0, x: 24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                            className="lg:col-span-3">

                            {contactSent ? (
                                <div className="flex flex-col items-center justify-center h-full min-h-[360px] rounded-2xl border border-green-100 bg-green-50 p-10 text-center">
                                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
                                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Message sent!</h3>
                                    <p className="text-slate-500 text-sm max-w-xs">
                                        Thanks for reaching out. We'll get back to you within one business day.
                                    </p>
                                    <button
                                        onClick={() => setContactSent(false)}
                                        className="mt-6 text-violet-600 text-sm font-semibold hover:underline"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={submitContact}
                                      className="rounded-2xl border border-slate-100 bg-slate-50/60 p-8 space-y-5">

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                Full name <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Bilal Akhtar"
                                                value={contact.data.name}
                                                onChange={e => contact.setData('name', e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900
                                                           text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
                                            />
                                            {contact.errors.name && <p className="text-red-500 text-xs mt-1">{contact.errors.name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                Email <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="bilal@company.com"
                                                value={contact.data.email}
                                                onChange={e => contact.setData('email', e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900
                                                           text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
                                            />
                                            {contact.errors.email && <p className="text-red-500 text-xs mt-1">{contact.errors.email}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                Company
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Acme Corp"
                                                value={contact.data.company}
                                                onChange={e => contact.setData('company', e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900
                                                           text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="+92 300 000 0000"
                                                value={contact.data.phone}
                                                onChange={e => contact.setData('phone', e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900
                                                           text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                            Subject <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Question about the Pro plan"
                                            value={contact.data.subject}
                                            onChange={e => contact.setData('subject', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900
                                                       text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
                                        />
                                        {contact.errors.subject && <p className="text-red-500 text-xs mt-1">{contact.errors.subject}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                            Message <span className="text-red-400">*</span>
                                        </label>
                                        <textarea
                                            required
                                            rows={5}
                                            placeholder="Tell us what you need and we'll get back to you..."
                                            value={contact.data.message}
                                            onChange={e => contact.setData('message', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900
                                                       text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition resize-none"
                                        />
                                        {contact.errors.message && <p className="text-red-500 text-xs mt-1">{contact.errors.message}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={contact.processing}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white
                                                   text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                                        style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}
                                    >
                                        {contact.processing ? (
                                            <>
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                                </svg>
                                                Sending…
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </motion.div>
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
                            <div className="flex items-center gap-2.5 mb-4">
                                <LogoMark size={32} />
                                <span className="font-extrabold text-white text-[17px] tracking-tight leading-none">Lumenia CRM</span>
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
