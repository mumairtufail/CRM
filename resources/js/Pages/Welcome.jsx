import { useState, useEffect } from 'react';
import { Link, useForm, Head, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, FileText, Upload, Users, PenTool, Link2,
    Check, ChevronDown, Star, Menu, X, Quote,
    CheckCircle2, ArrowRight, Phone, Send, MapPin,
    Layers, Sparkles, Shield, Clock,
} from 'lucide-react';
import { LogoMark } from '@/Components/Common/Logo';
import ChatWidget from '@/Components/Common/ChatWidget';
import SiteFooter from '@/Components/Common/SiteFooter';
import FeatureOrbit from '@/Components/Marketing/FeatureOrbit';
import ActivityShowcase from '@/Components/Marketing/ActivityShowcase';
import ModuleShowcase, { MODULES } from '@/Components/Marketing/ModuleShowcase';
import { cn } from '@/lib/utils';

// ─── Variants ─────────────────────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
    hidden: {},
    show:   { transition: { staggerChildren: 0.09 } },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const SECONDARY_FEATURES = [
    { icon: Upload,    title: 'Import Your Own List', description: 'Bring in leads from a spreadsheet or Google Sheet any time, alongside whatever AI finds for you.' },
    { icon: FileText,  title: 'Custom Forms',         description: 'Drop an embeddable form on your site and every submission lands straight into your pipeline as a lead.' },
    { icon: Users,     title: 'Team & Reporting',     description: 'See what each rep is working, what is stuck, and what closed, without asking for a status update.' },
];

const FREE_TOOLS = [
    { icon: Mail,     title: 'Email Signature',   description: 'Design an HTML email signature for Gmail, Outlook, or Apple Mail, with your logo and socials.', href: '/tools/email-signature-generator', cta: 'Generate signature' },
    { icon: FileText, title: 'Invoice Generator', description: 'Build and download a branded PDF invoice on the spot, with automatic tax calculation.', href: '/tools/invoice-generator', cta: 'Build invoice' },
    { icon: PenTool,  title: 'Proposal Writer',   description: 'Draft a commercial proposal with deliverables and scope, ready to print or send as a PDF.', href: '/tools/proposal-writer', cta: 'Write proposal' },
    { icon: Link2,    title: 'UTM Link Builder',  description: 'Build trackable campaign links so you can see exactly which channel brought a lead in.', href: '/tools/utm-builder', cta: 'Build UTM link' },
];

const WHY_CHOOSE_US = [
    { icon: Layers,    title: 'One workspace, not five tools',  description: 'Leads, campaigns, pipeline, invoicing, and support all live in the same place, so nothing gets lost switching tabs.' },
    { icon: Sparkles,  title: 'AI that does the work, not just autocomplete', description: 'It finds prospects, drafts follow-ups, and answers WhatsApp chats itself, from a knowledge base you write.' },
    { icon: Shield,    title: 'Your data stays yours',           description: 'Every workspace is isolated at the database level, so agencies running multiple clients never risk a leak between accounts.' },
    { icon: Clock,     title: 'Real people when you need them',  description: 'Email us and hear back within one business day, not a support ticket that disappears into a queue.' },
];

const TESTIMONIALS = [
    { name: 'Marcus Reid',     role: 'Sales Manager, USA', avatar: 'MR', text: 'Our WhatsApp number used to get messages that just sat there until someone had time. Now the bot answers from the FAQ we wrote ourselves, and about a third of those chats turn into a real lead before I even see them.' },
    { name: 'Dana Whitfield',  role: 'Growth Lead, USA',   avatar: 'DW', text: 'Turned on automated follow ups in April and picked up 11 deals that month from people who never replied to the first email. That is money we were just leaving on the table before.' },
    { name: 'Julien Marchand', role: 'Founder, Canada',    avatar: 'JM', text: 'I used to run three spreadsheets just to remember who I had called that week. Now it is one board. Drag a card and it is done. Gets me back a solid afternoon every week I used to lose untangling my own mess.' },
];

const FAQS = [
    { q: 'Do I need a credit card to sign up?', a: 'No. The free plan stays free and trials do not ask for card details. You only add billing information if you choose to upgrade.' },
    { q: 'How does AI lead search actually work?', a: 'Type who you are looking for in plain English, industry, title, company size, location, whatever matters to you. Lumenia queries Apollo.io and People Data Labs at the same time and brings back verified people with an email, phone number, and LinkedIn profile already filled in.' },
    { q: 'What are batches and groups for?', a: 'Every import or manual add lands in a batch automatically. You can also build your own groups, by campaign, region, or however you organize your work, so you are never scrolling one long list.' },
    { q: 'Do follow up emails really send on their own?', a: 'Yes, once you turn it on for a campaign. Set how long to wait, and anyone who has not opened your email gets a follow up automatically, on the schedule you chose.' },
    { q: 'Which AI models power the chatbot?', a: 'You can connect OpenAI, Kimi, or Claude. Whichever you choose reads from a knowledge base you write yourself, so answers sound like you, not a generic script, and it can carry the full conversation with a lead.' },
    { q: 'Does the chatbot actually create leads?', a: 'Yes. The moment a conversation shows real interest, a pricing question, wanting a demo, whatever counts as a signal for you, it creates the lead and drops it straight into your pipeline, already tagged.' },
    { q: 'Is my workspace data separated from other companies using Lumenia CRM?', a: 'Yes. Every workspace is isolated at the database level. Nobody outside your team can see your leads, emails, or pipeline.' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Welcome({ appUrl, plans = [], chatbot = {} }) {
    const { props } = usePage();
    const seo = props.seo || {};

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
        { label: 'How it works', href: '#flow'    },
        { label: 'Features',     href: '#modules' },
        { label: 'Pricing',      href: '#pricing' },
        { label: 'Contact',      href: '#contact'  },
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
            <Head>
                <title>{seo.meta_title || 'LumeniaCRM'}</title>
                <meta name="description" content={seo.meta_description || ''} />
                {seo.meta_keywords && <meta name="keywords" content={seo.meta_keywords} />}
                <link rel="canonical" href={`https://${appUrl}/`} />

                <meta property="og:title" content={seo.meta_title || 'LumeniaCRM'} />
                <meta property="og:description" content={seo.meta_description || ''} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`https://${appUrl}/`} />
                <meta property="og:image" content={`https://${appUrl}/og-image.png`} />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seo.meta_title || 'LumeniaCRM'} />
                <meta name="twitter:description" content={seo.meta_description || ''} />
                <meta name="twitter:image" content={`https://${appUrl}/og-image.png`} />

                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'SoftwareApplication',
                        name: 'LumeniaCRM',
                        applicationCategory: 'BusinessApplication',
                        operatingSystem: 'Web',
                        description: seo.meta_description || undefined,
                        url: `https://${appUrl}/`,
                        offers: plans.length > 0
                            ? plans.map(plan => ({
                                '@type': 'Offer',
                                name: plan.name,
                                price: String(plan.price_monthly ?? '0'),
                                priceCurrency: 'USD',
                            }))
                            : undefined,
                    })}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: FAQS.map(({ q, a }) => ({
                            '@type': 'Question',
                            name: q,
                            acceptedAnswer: { '@type': 'Answer', text: a },
                        })),
                    })}
                </script>
            </Head>

            {/* ── Nav ──────────────────────────────────────────────────────── */}
            <nav className={`fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${
                scrolled ? 'shadow-sm border-b border-slate-100' : 'border-b border-transparent'
            }`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2.5">
                            <LogoMark size={34} />
                            <span className="font-extrabold text-[17px] tracking-tight leading-none text-slate-900">
                                Lumenia CRM
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map(({ label, href }) => (
                                <a key={label} href={href}
                                   className="text-sm font-medium text-slate-600 transition-colors hover:text-violet-500">{label}</a>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center gap-2">
                            <Link href="/login"
                                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                                Sign In
                            </Link>
                            <Link href="/register"
                                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                                  style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                                Get Started
                            </Link>
                        </div>

                        <button className="md:hidden p-1.5 text-slate-700"
                                onClick={() => setMobileOpen(v => !v)}>
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {mobileOpen && (
                    <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1">
                        {navLinks.map(({ label, href }) => (
                            <a key={label} href={href} onClick={() => setMobileOpen(false)}
                               className="block py-2.5 text-slate-600 hover:text-slate-900 text-sm font-medium">{label}</a>
                        ))}
                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                            <Link href="/login"
                                  className="block py-3 rounded-xl text-center text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50">
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
            <section className="relative overflow-hidden pt-16 bg-white">
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">

                        <motion.div variants={stagger} initial="hidden" animate="show">
                            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
                                <div className="h-px w-10 bg-violet-400" />
                                <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">Lumenia CRM</span>
                            </motion.div>

                            <motion.h1 variants={fadeUp}
                                       className="text-[40px] sm:text-6xl lg:text-[58px] font-black text-slate-900
                                                  leading-[1.06] tracking-tight mb-7">
                                Find leads, follow up,<br />and close the deal.
                            </motion.h1>

                            <motion.p variants={fadeUp}
                                      className="text-slate-500 text-lg sm:text-xl leading-relaxed mb-10 max-w-[440px]">
                                Lumenia CRM finds new customers with AI, runs your email and WhatsApp
                                follow ups on its own, and replies to leads itself so nothing sits unanswered.
                            </motion.p>

                            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start gap-3 mb-10">
                                <Link href="/register"
                                      className="group relative overflow-hidden inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base
                                                 font-semibold text-white transition-all
                                                 hover:shadow-xl hover:shadow-violet-500/20 hover:-translate-y-px"
                                      style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                                    <span className="relative">Create Free Account</span>
                                    <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                                <Link href="/login"
                                      className="inline-flex items-center gap-1.5 px-7 py-3.5 rounded-xl text-base font-medium
                                                 text-slate-500 hover:text-slate-900 transition-colors">
                                    Sign in <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                                </Link>
                            </motion.div>

                            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-x-8 gap-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2.5">
                                        {TESTIMONIALS.map(({ avatar }, i) => (
                                            <div key={avatar}
                                                 className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white
                                                            border-2 border-white shadow-sm"
                                                 style={{ background: `linear-gradient(135deg, ${['#7C3AED','#3B82F6','#10B981'][i]}, #4F46E5)` }}>
                                                {avatar}
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1 mb-0.5">
                                            {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                                            <span className="text-slate-700 text-xs font-semibold ml-1">4.9</span>
                                        </div>
                                        <div className="text-slate-400 text-xs">Free plan, no card needed</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 text-slate-400 text-xs">
                                    <span><span className="text-slate-800 font-bold">500+</span> workspaces</span>
                                    <span><span className="text-slate-800 font-bold">50k+</span> leads tracked</span>
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="relative"
                        >
                            <img
                                src="/images/marketing/hero-team.jpg"
                                alt="A sales team meeting and smiling together in a modern office"
                                className="w-full aspect-[4/3] object-cover rounded-3xl shadow-xl"
                            />
                            <div className="absolute -bottom-5 -left-5 sm:-left-8 bg-white rounded-2xl shadow-lg border border-slate-100 px-4 py-3 flex items-center gap-3 max-w-[240px]">
                                <div className="flex -space-x-2 shrink-0">
                                    {TESTIMONIALS.map(({ avatar }, i) => (
                                        <div key={avatar}
                                             className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-white"
                                             style={{ background: `linear-gradient(135deg, ${['#7C3AED','#3B82F6','#10B981'][i]}, #4F46E5)` }}>
                                            {avatar}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-slate-700 text-xs font-medium leading-snug">
                                    Trusted by 500+ sales teams
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Works with strip ─────────────────────────────────────────── */}
            <section className="py-7 border-y border-slate-100 bg-white">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10">
                        <span className="text-slate-300 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                            Works with
                        </span>
                        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
                            {['Apollo.io', 'People Data Labs', 'Gmail', 'Outlook', 'WhatsApp Business', 'OpenAI', 'Claude', 'Kimi'].map(name => (
                                <span key={name}
                                      className="text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors cursor-default">
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Why choose us ────────────────────────────────────────────── */}
            <section id="why-us" className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-14 max-w-2xl">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-violet-400" />
                            <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">Why choose us</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-4">
                            Built to replace the mess, not add to it.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-slate-500 text-lg">
                            Here is what actually sets Lumenia apart from a spreadsheet and four disconnected apps.
                        </motion.p>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {WHY_CHOOSE_US.map(({ icon: Icon, title, description }) => (
                            <motion.div key={title} variants={fadeUp}
                                        className="rounded-2xl border border-slate-100 p-6 flex gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-violet-50">
                                    <Icon className="w-5 h-5 text-violet-600" />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-bold text-slate-900 mb-1.5">{title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Modules in depth ─────────────────────────────────────────── */}
            <section id="modules" className="py-24 bg-white border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16 items-start">
                        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                                    className="lg:sticky lg:top-28 rounded-3xl border border-slate-100 bg-slate-50/60 p-6 sm:p-8">
                            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                                <div className="h-px w-10 bg-violet-400" />
                                <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">Features</span>
                            </motion.div>
                            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                                Every module, explained.
                            </motion.h2>
                            <motion.p variants={fadeUp} className="text-slate-500 text-lg mt-3 mb-8">
                                What each part actually does, and how it fits with the rest.
                            </motion.p>

                            <motion.div variants={fadeUp} className="space-y-0.5">
                                {MODULES.map(({ tag }) => (
                                    <div key={tag}
                                         className="flex items-center gap-2.5 py-2.5 border-t border-slate-200/70 first:border-t-0 text-sm font-semibold text-slate-700">
                                        <Check className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                                        {tag}
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>

                        <ModuleShowcase />
                    </div>
                </div>
            </section>

            {/* ── The Flow ─────────────────────────────────────────────────── */}
            <section id="flow" className="py-24" style={{ background: '#F7F6FE' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-14 max-w-2xl">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-violet-500" />
                            <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">How it works</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-4">
                            From a first hello to a closed deal, in one place.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-slate-500 text-lg">
                            Here is the whole path a lead takes through Lumenia CRM, start to finish.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <FeatureOrbit />
                    </motion.div>
                </div>
            </section>

            {/* ── Secondary tools ──────────────────────────────────────────── */}
            <section id="tools" className="py-24 bg-white border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-violet-400" />
                            <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">Also included</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                            A few more things, so nothing needs a second tool.
                        </motion.h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                                className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {SECONDARY_FEATURES.map(({ icon: Icon, title, description }) => (
                            <motion.div key={title} variants={fadeUp}
                                        className="rounded-2xl border border-slate-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-violet-50">
                                    <Icon className="w-[18px] h-[18px] text-violet-600" />
                                </div>
                                <h3 className="text-[15px] font-bold text-slate-900 mb-2">{title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Free Tools ───────────────────────────────────────────────── */}
            <section id="free-tools" className="py-24 border-t border-slate-100" style={{ background: '#F8F9FD' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12 max-w-xl">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-violet-400" />
                            <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">Free tools</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-3">
                            A few things you can use right now, free, no account needed.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-slate-500 text-lg">
                            Small tools we built for ourselves and figured other people could use too.
                        </motion.p>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-3xl border border-slate-200
                                           divide-y divide-slate-200 sm:divide-y-0 sm:divide-x overflow-hidden bg-white">
                        {FREE_TOOLS.map(({ icon: Icon, title, description, href, cta }, i) => (
                            <motion.div key={title} variants={fadeUp}
                                        className="group relative p-7 sm:p-8 flex flex-col hover:bg-violet-50/50 transition-colors">
                                <div className="flex items-start justify-between mb-8">
                                    <span className="text-6xl font-black leading-none text-violet-100 group-hover:text-violet-200 transition-colors select-none">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-violet-50 group-hover:bg-violet-600 transition-colors shrink-0">
                                        <Icon className="w-4 h-4 text-violet-600 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-violet-700 transition-colors">
                                    {title}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">{description}</p>
                                <Link href={href}
                                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                                    {cta}
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Testimonials ─────────────────────────────────────────────── */}
            <section className="py-24 border-t border-slate-100" style={{ background: '#F8F9FD' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-violet-400" />
                            <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">What people say</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                            From teams that actually use it.
                        </motion.h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                                className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-5 lg:h-[560px]">
                        {TESTIMONIALS.map(({ name, role, avatar, text }, i) => {
                            const featured = i === 0;
                            return (
                                <motion.div key={name} variants={fadeUp}
                                            className={cn(
                                                'relative rounded-3xl p-8 flex flex-col justify-between overflow-hidden',
                                                featured ? 'lg:col-span-2 lg:row-span-2 min-h-[280px]' : 'min-h-[220px]',
                                            )}
                                            style={featured
                                                ? { background: 'linear-gradient(155deg,#1B1030 0%,#0F0A1F 100%)' }
                                                : { background: '#fff', border: '1px solid #F1F5F9' }}>
                                    <Quote
                                        className={cn('absolute -top-4 -right-4 w-32 h-32 pointer-events-none', featured ? 'text-white/[0.04]' : 'text-violet-50')}
                                        fill="currentColor" strokeWidth={0}
                                    />
                                    <div className="relative">
                                        <div className="flex gap-1 mb-4">
                                            {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                                        </div>
                                        <blockquote className={cn('leading-relaxed', featured ? 'text-xl sm:text-2xl text-white/90 font-medium' : 'text-[13px] text-slate-700')}>
                                            "{text}"
                                        </blockquote>
                                    </div>
                                    <div className="relative flex items-center gap-2.5 mt-6">
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                                             style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                                            {avatar}
                                        </div>
                                        <div>
                                            <div className={cn('font-semibold text-[13px]', featured ? 'text-white' : 'text-slate-900')}>{name}</div>
                                            <div className={cn('text-[11px]', featured ? 'text-white/40' : 'text-slate-400')}>{role}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* ── Pricing ──────────────────────────────────────────────────── */}
            <section id="pricing" className="py-24" style={{ background: '#0A0812' }}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center">
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-3 mb-5">
                            <div className="h-px w-10 bg-violet-500" />
                            <span className="text-violet-400 text-xs font-bold uppercase tracking-widest">Pricing</span>
                            <div className="h-px w-10 bg-violet-500" />
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                            Pricing that fits your team.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-white/40 text-lg mb-14 max-w-lg mx-auto leading-relaxed">
                            Start free. Upgrade whenever you need more, just sign up and we will take it from there.
                        </motion.p>
                    </motion.div>

                    {plans.length > 0 && (
                        <motion.div
                            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
                        >
                            {plans.map((plan) => (
                                <motion.div
                                    key={plan.id}
                                    variants={fadeUp}
                                    className="relative rounded-2xl p-8 flex flex-col border"
                                    style={{
                                        background: plan.is_featured ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.025)',
                                        borderColor: plan.is_featured ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)',
                                    }}
                                >
                                    {plan.is_featured && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold text-white whitespace-nowrap"
                                            style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                                            <Star className="w-3 h-3 fill-white" /> Most Popular
                                        </div>
                                    )}

                                    <h3 className="text-white font-bold text-xl mb-1.5">{plan.name}</h3>
                                    <p className="text-white/40 text-sm mb-6 min-h-[40px]">{plan.tagline}</p>

                                    <div className="mb-6 flex items-baseline gap-2">
                                        {plan.price_monthly_original && (
                                            <span className="text-lg line-through text-white/30">${Number(plan.price_monthly_original).toFixed(0)}</span>
                                        )}
                                        <span className="text-4xl font-black text-white">${Number(plan.price_monthly ?? 0).toFixed(0)}</span>
                                        <span className="text-white/35 text-sm font-medium">/mo</span>
                                    </div>

                                    <div className="flex-1 space-y-3 mb-8">
                                        {plan.description ? (
                                            <div
                                                className="plan-rich-description text-white/70 text-sm space-y-2"
                                                dangerouslySetInnerHTML={{ __html: plan.description }}
                                            />
                                        ) : (
                                            <>
                                                <div className="flex items-start gap-2.5 text-white/70 text-sm">
                                                    <Check className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                                                    Core CRM, leads, pipeline, invoicing, reports, team
                                                </div>
                                                {plan.modules.map((m) => (
                                                    <div key={m.id} className="flex items-start gap-2.5 text-white/70 text-sm">
                                                        <Check className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                                                        {m.name}
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>

                                    <Link href="/register"
                                        className={cn(
                                            'group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:-translate-y-px',
                                            plan.is_featured
                                                ? 'text-white hover:opacity-90 hover:shadow-2xl hover:shadow-violet-500/25'
                                                : 'text-white/70 border border-white/15 hover:bg-white/5 hover:text-white'
                                        )}
                                        style={plan.is_featured ? { background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' } : undefined}
                                    >
                                        {plan.cta_text || 'Get started'}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                    {plan.cta_text?.toLowerCase().includes('upgrade') && (
                                        <p className="text-white/30 text-xs mt-2.5 text-center">Sign up free, then contact us to upgrade.</p>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* ── Live Timeline ─────────────────────────────────────────────── */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ActivityShowcase />
                </div>
            </section>

            {/* ── FAQ ──────────────────────────────────────────────────────── */}
            <section id="faq" className="py-24 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-violet-400" />
                            <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">FAQ</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
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
                                initial={{ opacity: 0, y: 14 }}
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

            {/* ── Contact ──────────────────────────────────────────────────── */}
            <section id="contact" className="py-24" style={{ background: '#F8F9FD' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6">

                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-violet-400" />
                            <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">Get in touch</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-4">
                            Let's talk.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-slate-500 text-lg max-w-lg">
                            Have a question, need a demo, or want to discuss a custom plan?
                            Send us a message and we will get back to you within one business day.
                        </motion.p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

                        <motion.div
                            initial={{ opacity: 0, x: -24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            className="lg:col-span-2 space-y-8">

                            {[
                                { icon: Mail,    title: 'Email us',      value: 'hello@lumenialab.com',   sub: 'We reply within 24 hours', color: '#7C3AED', bg: '#F5F3FF' },
                                { icon: Phone,   title: 'Call us',       value: '+92 335 445 5494',       sub: 'Available 24 hours',        color: '#059669', bg: '#ECFDF5' },
                                { icon: MapPin,  title: 'Headquarters',  value: 'Lahore, Pakistan',        sub: 'Lumenia Lab Pvt. Ltd.',     color: '#D97706', bg: '#FFFBEB' },
                            ].map(({ icon: Icon, title, value, sub, color, bg }) => (
                                <div key={title} className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: bg }}>
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
                                        Thanks for reaching out. We will get back to you within one business day.
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
                                      className="rounded-2xl border border-slate-100 bg-white p-8 space-y-5">

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
                                                placeholder="+92 335 445 5494"
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
            <section className="py-28 relative overflow-hidden"
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
                               className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
                        Give it a try. It's free to start.
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
            <SiteFooter />

            <style>{`
                .plan-rich-description ul {
                    list-style-type: disc !important;
                    padding-left: 1.25rem !important;
                    margin-top: 0.5rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .plan-rich-description li {
                    margin-bottom: 0.25rem !important;
                    list-style-type: disc !important;
                }
                .plan-rich-description p {
                    margin-bottom: 0.5rem !important;
                }
            `}</style>

            {chatbot?.enabled && (
                <ChatWidget
                    agentName={chatbot.agent_name}
                    welcomeMessage={chatbot.welcome_message}
                />
            )}
        </div>
    );
}
