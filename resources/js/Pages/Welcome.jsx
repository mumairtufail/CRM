import { useState, useEffect } from 'react';
import { Link, useForm, Head, usePage, router } from '@inertiajs/react';
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
import DotGrid from '@/Components/Marketing/DotGrid';
import { cn } from '@/lib/utils';
import { getPaddle } from '@/lib/paddle';
import SubscribeAuthModal from '@/Components/Marketing/SubscribeAuthModal';

// ─── Variants ─────────────────────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
    hidden: {},
    show:   { transition: { staggerChildren: 0.09 } },
};

// ─── Hero rotating word ───────────────────────────────────────────────────────

const HERO_WORDS = ['finds your leads', 'writes your follow-ups', 'sends your invoices', 'closes your deals'];

function RotatingWord() {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setIndex(i => (i + 1) % HERO_WORDS.length), 2400);
        return () => clearInterval(id);
    }, []);
    return (
        // Fixed-height slot on its own line: each phrase animates in centered,
        // so the surrounding headline never reflows.
        <span className="relative block h-[1.35em] overflow-hidden text-[length:min(7.5vw,0.85em)]">
            <AnimatePresence mode="wait">
                <motion.span
                    key={index}
                    initial={{ y: '70%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '-70%', opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 flex items-center justify-center
                               whitespace-nowrap text-brand-600"
                >
                    {HERO_WORDS[index]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}

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
    { icon: Sparkles,  title: 'AI that does the work, not just autocomplete', description: 'It finds prospects and drafts follow-ups today, and will answer WhatsApp chats itself once that launches, all from a knowledge base you write.' },
    { icon: Shield,    title: 'Your data stays yours',           description: 'Every workspace is isolated at the database level, so agencies running multiple clients never risk a leak between accounts.' },
    { icon: Clock,     title: 'Real people when you need them',  description: 'Email us and hear back within one business day, not a support ticket that disappears into a queue.' },
];

const TESTIMONIALS = [
    { name: 'Marcus Reid',     role: 'Sales Manager, USA',        avatar: 'MR', text: 'I dial straight from a lead\'s profile now, and every call, in or out, lands on their timeline automatically with the recording attached. I stopped digging through a separate Twilio dashboard just to remember who I actually reached.' },
    { name: 'Priya Nair',      role: 'Founder, India',            avatar: 'PN', text: 'I typed "marketing directors at Shopify stores under 50 employees, UK" and had 40 verified people with emails in under a minute. I used to pay a VA a week to build that same list by hand.' },
    { name: 'Dana Whitfield',  role: 'Growth Lead, USA',          avatar: 'DW', text: 'Turned on automated follow ups in April and picked up 11 deals that month from people who never replied to the first email. That is money we were just leaving on the table before.' },
    { name: 'Julien Marchand', role: 'Founder, Canada',           avatar: 'JM', text: 'I used to run three spreadsheets just to remember who I had called that week. Now it is one board. Drag a card and it is done. Gets me back a solid afternoon every week I used to lose untangling my own mess.' },
    { name: 'Tom Hendricks',   role: 'BDR, Australia',            avatar: 'TH', text: 'I was sure the AI search would just hand me scraped junk. Every contact it has pulled so far has had a working email and the right title attached. It quietly replaced two paid tools we were stacking on top of each other.' },
    { name: 'Sofia Delgado',   role: 'Marketing Coordinator, Spain', avatar: 'SD', text: 'Opens, clicks, and replies all sit on one timeline per contact, so I stopped exporting CSVs into a separate analytics tool just to know who to chase next. Campaign tracking here is genuinely that easy.' },
    { name: 'Ben Foster',      role: 'Sales Manager, UK',         avatar: 'BF', text: 'Any lead that goes quiet for five days gets a follow up drafted automatically in my own voice, I just review and hit send. That alone closed four deals last quarter that would have gone cold otherwise.' },
    { name: 'Ryan Ostrowski',  role: 'Sales Ops, USA',            avatar: 'RO', text: 'Set up a four step email campaign in fifteen minutes and had reply rates per step visible by the next morning. Our old platform took a full day just to render that same report.' },
    { name: 'Helena Brandt',   role: 'Ops Manager, Germany',      avatar: 'HB', text: 'We moved off three separate tools in an afternoon and support answered every question we had within the hour. Nothing about switching over felt risky.' },
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

export default function Welcome({ appUrl, chatbot = {}, paddle = {}, country = null, tiers = [] }) {
    const { props } = usePage();
    const seo = props.seo || {};
    const userEmail = props.auth?.user?.email || undefined;

    const [mobileOpen, setMobileOpen] = useState(false);
    const [openFaq,    setOpenFaq]    = useState(null);
    const [scrolled,   setScrolled]   = useState(false);
    const [contactSent, setContactSent] = useState(false);

    const [billingCycle, setBillingCycle] = useState('month');
    const [pricePreviews, setPricePreviews] = useState({});
    const [previewError, setPreviewError] = useState(false);
    const [checkoutTier, setCheckoutTier] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [pendingTier, setPendingTier] = useState(null);

    const contact = useForm({
        name: '', email: '', company: '', phone: '', subject: '', message: '',
    });

    useEffect(() => {
        let cancelled = false;
        setPreviewError(false);

        getPaddle(paddle)
            .then((instance) => instance.PricePreview({
                items: tiers.map((tier) => ({ priceId: tier.priceId[billingCycle], quantity: 1 })),
                ...(country ? { address: { countryCode: country } } : {}),
            }))
            .then((result) => {
                if (cancelled) return;
                const lineItems = result?.data?.details?.lineItems || [];
                const byPriceId = {};
                lineItems.forEach((item) => { byPriceId[item.price.id] = item.formattedTotals; });
                setPricePreviews(byPriceId);
            })
            .catch(() => { if (!cancelled) setPreviewError(true); });

        return () => { cancelled = true };
    }, [billingCycle, country, paddle.environment, paddle.clientToken, tiers]);

    const organizationId = props.organization?.id;

    // Once the auth modal reports success, it reloads the auth/organization
    // Inertia props (see onAuthenticated below) — this effect picks up the
    // fresh userEmail/organizationId as soon as they land and proceeds to
    // checkout. Deliberately not calling openCheckout directly from the
    // modal's own success callback: that callback closes over the render it
    // was created in, which still has the pre-login (empty) auth props, so
    // it would just bounce straight back to the "not signed in" branch below.
    useEffect(() => {
        if (pendingTier && userEmail && organizationId) {
            setAuthModalOpen(false);
            const tier = pendingTier;
            setPendingTier(null);
            openCheckout(tier);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingTier, userEmail, organizationId]);

    // Checkout only ever runs for a signed-in user's own organization —
    // fulfillment (the Paddle webhook) needs a real organization_id to attach
    // the subscription to and grant access on. An anonymous click opens the
    // sign-in/register modal instead of leaving the page.
    const openCheckout = (tier) => {
        if (!userEmail || !organizationId) {
            setPendingTier(tier);
            setAuthModalOpen(true);
            return;
        }

        setCheckoutTier(tier.slug);
        getPaddle(paddle)
            .then((instance) => {
                instance.Checkout.open({
                    items: [{ priceId: tier.priceId[billingCycle], quantity: 1 }],
                    customer: { email: userEmail },
                    customData: { plan_slug: tier.slug, organization_id: organizationId },
                    settings: {
                        displayMode: 'overlay',
                        variant: 'one-page',
                        // Checkout only ever runs for a signed-in user (see the
                        // gate above), so they already have a workspace —
                        // straight to the dashboard, not a "create your
                        // workspace" page. The ?checkout=success marker is
                        // what triggers the "thanks for subscribing" toast in
                        // AppLayout — Paddle's redirect is a plain browser
                        // navigation, there's no server-side flash to hook.
                        successUrl: `${window.location.origin}/dashboard?checkout=success`,
                    },
                });
            })
            .catch(() => setPreviewError(true))
            .finally(() => setCheckoutTier(null));
    };

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
        <div className="min-h-screen bg-brand-tint font-sans antialiased">
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
                        // Prices are localized per visitor via Paddle at render time, so a
                        // static catalog price here would go stale/mismatched — omitted
                        // rather than hardcoding a number that isn't what anyone is charged.
                        offers: tiers.map(tier => ({
                            '@type': 'Offer',
                            name: tier.name,
                            priceCurrency: 'USD',
                        })),
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
                                   className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-500">{label}</a>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center gap-2">
                            <Link href="/login"
                                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                                Sign In
                            </Link>
                            <Link href="/register"
                                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                                  style={{ background: 'linear-gradient(135deg,rgb(var(--brand-700)),rgb(var(--brand2-700)))' }}>
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
                                  style={{ background: 'linear-gradient(135deg,rgb(var(--brand-700)),rgb(var(--brand2-700)))' }}>
                                Get Started
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden pt-16 bg-white">
                <DotGrid
                    dotSize={6}
                    gap={24}
                    baseColor="--brand-300"
                    activeColor="--brand-700"
                    baseAlpha={0.45}
                    activeAlpha={1}
                    proximity={150}
                />

                <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-36 text-center">
                    <motion.div variants={stagger} initial="hidden" animate="show">
                        <motion.h1 variants={fadeUp}
                                   className="text-[42px] sm:text-6xl lg:text-7xl font-black text-slate-900
                                              leading-[1.08] tracking-tight mb-8">
                            The CRM that
                            <RotatingWord />
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-slate-500 text-lg sm:text-xl mb-10">
                            AI prospecting, follow-ups, and replies, all on autopilot.
                        </motion.p>

                        <motion.div variants={fadeUp}
                                    className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link href="/register"
                                  className="group relative overflow-hidden inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base
                                             font-semibold text-white transition-all
                                             hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-px"
                                  style={{ background: 'linear-gradient(135deg,rgb(var(--brand-700)),rgb(var(--brand2-700)))' }}>
                                <span className="relative">Create Free Account</span>
                                <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <Link href="/login"
                                  className="inline-flex items-center gap-1.5 px-7 py-4 rounded-xl text-base font-medium
                                             text-slate-500 hover:text-slate-900 transition-colors">
                                Sign in <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── Works with strip ─────────────────────────────────────────── */}
            <section className="py-10 border-y border-slate-100 bg-brand-tint">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-slate-300 text-xs font-bold uppercase tracking-widest mb-6">
                        Works with
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-x-4 gap-y-5">
                        {[
                            { name: 'Apollo.io', logo: '/images/integrations/apollo.png' },
                            { name: 'People Data Labs', logo: '/images/integrations/pdl.png' },
                            { name: 'Gmail', logo: '/images/integrations/gmail.svg' },
                            { name: 'Outlook', logo: '/images/integrations/outlook.png' },
                            { name: 'WhatsApp Business', logo: '/images/integrations/whatsapp.svg', soon: true },
                            { name: 'OpenAI', logo: '/images/integrations/openai.svg' },
                            { name: 'Claude', logo: '/images/integrations/claude.svg' },
                            { name: 'Kimi', logo: '/images/integrations/kimi.svg' },
                        ].map(({ name, logo, soon }) => (
                            <span key={name}
                                  className="flex flex-col items-center gap-2 opacity-80 hover:opacity-100 transition-opacity cursor-default">
                                <img src={logo} alt={`${name} logo`} loading="lazy"
                                     className="h-7 w-7 object-contain rounded-md" />
                                <span className="text-slate-500 text-xs font-semibold text-center leading-tight">
                                    {name}
                                    {soon && <span className="block text-brand-500 text-[10px] font-bold uppercase tracking-wide mt-0.5">Coming soon</span>}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Why choose us ────────────────────────────────────────────── */}
            <section id="why-us" className="py-24 bg-brand-tint">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-14 max-w-2xl">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-brand-400" />
                            <span className="text-brand-600 text-xs font-bold uppercase tracking-widest">Why choose us</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-4">
                            Built to replace the mess, not add to it.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-slate-500 text-lg">
                            Here is what actually sets Lumenia apart from a spreadsheet and four disconnected apps.
                        </motion.p>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                                className="grid grid-cols-1 sm:grid-cols-2 rounded-3xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-200 sm:divide-y-0">
                        {WHY_CHOOSE_US.map(({ icon: Icon, title, description }, i) => (
                            <motion.div key={title} variants={fadeUp}
                                        className={cn(
                                            'group relative p-8 sm:p-10 transition-colors duration-300 hover:bg-brand-50/40',
                                            i % 2 === 0 && 'sm:border-r sm:border-slate-200',
                                            i < 2 && 'sm:border-b sm:border-slate-200',
                                        )}>
                                <span className="absolute top-7 right-8 text-6xl font-black leading-none text-slate-100 group-hover:text-brand-100 transition-colors duration-300 select-none tabular-nums">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <div className="relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-brand-50 mb-5">
                                    <Icon className="w-5 h-5 text-brand-600" />
                                </div>
                                <h3 className="relative text-[15px] font-bold text-slate-900 mb-1.5 pr-14">{title}</h3>
                                <p className="relative text-slate-500 text-sm leading-relaxed max-w-sm">{description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Modules in depth ─────────────────────────────────────────── */}
            <section id="modules" className="py-24 bg-brand-tint border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ModuleShowcase />
                </div>
            </section>

            {/* ── The Flow ─────────────────────────────────────────────────── */}
            <section id="flow" className="py-24" style={{ background: 'rgb(var(--brand-tint))' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-14 max-w-2xl">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-brand-500" />
                            <span className="text-brand-600 text-xs font-bold uppercase tracking-widest">How it works</span>
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
            <section id="tools" className="py-24 bg-brand-tint border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-brand-400" />
                            <span className="text-brand-600 text-xs font-bold uppercase tracking-widest">Also included</span>
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
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-brand-50">
                                    <Icon className="w-[18px] h-[18px] text-brand-600" />
                                </div>
                                <h3 className="text-[15px] font-bold text-slate-900 mb-2">{title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Free Tools ───────────────────────────────────────────────── */}
            <section id="free-tools" className="py-24 border-t border-slate-100" style={{ background: 'rgb(var(--brand-tint))' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12 max-w-xl">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-brand-400" />
                            <span className="text-brand-600 text-xs font-bold uppercase tracking-widest">Free tools</span>
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
                                        className="group relative p-7 sm:p-8 flex flex-col hover:bg-brand-50/50 transition-colors">
                                <div className="flex items-start justify-between mb-8">
                                    <span className="text-6xl font-black leading-none text-brand-100 group-hover:text-brand-200 transition-colors select-none">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-brand-50 group-hover:bg-brand-600 transition-colors shrink-0">
                                        <Icon className="w-4 h-4 text-brand-600 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-brand-700 transition-colors">
                                    {title}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">{description}</p>
                                <Link href={href}
                                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                                    {cta}
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Testimonials ─────────────────────────────────────────────── */}
            <section className="py-24 border-t border-slate-100" style={{ background: 'rgb(var(--brand-tint))' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-brand-400" />
                            <span className="text-brand-600 text-xs font-bold uppercase tracking-widest">What people say</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                            From teams that actually use it.
                        </motion.h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {TESTIMONIALS.map(({ name, role, avatar, text }, i) => {
                            const featured = i === 0;
                            return (
                                <motion.div key={name} variants={fadeUp}
                                            className={cn(
                                                'relative rounded-3xl p-8 flex flex-col justify-between overflow-hidden',
                                                featured ? 'sm:col-span-2 min-h-[280px]' : 'min-h-[220px]',
                                            )}
                                            style={featured
                                                ? { background: 'linear-gradient(155deg,rgb(var(--brand-ink2)) 0%,rgb(var(--brand-ink)) 100%)' }
                                                : { background: '#fff', border: '1px solid #F1F5F9' }}>
                                    <Quote
                                        className={cn('absolute -top-4 -right-4 w-32 h-32 pointer-events-none', featured ? 'text-white/[0.04]' : 'text-brand-50')}
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
                                             style={{ background: 'linear-gradient(135deg,rgb(var(--brand-700)),rgb(var(--brand2-700)))' }}>
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
            <section id="pricing" className="py-24" style={{ background: 'linear-gradient(155deg,rgb(var(--brand-ink2)) 0%,rgb(var(--brand-ink)) 100%)' }}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center">
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-3 mb-5">
                            <div className="h-px w-10 bg-brand-500" />
                            <span className="text-brand-400 text-xs font-bold uppercase tracking-widest">Pricing</span>
                            <div className="h-px w-10 bg-brand-500" />
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                            Pricing that fits your team.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-white/40 text-lg mb-14 max-w-lg mx-auto leading-relaxed">
                            Start free. Upgrade whenever you need more, just sign up and we will take it from there.
                        </motion.p>
                    </motion.div>

                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                                className="flex justify-center mb-12">
                        <div className="inline-flex items-center p-1 rounded-full bg-white/5 border border-white/10">
                            {[['month', 'Monthly'], ['year', 'Yearly']].map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setBillingCycle(value)}
                                    className={cn(
                                        'px-5 py-2 rounded-full text-sm font-semibold transition-all',
                                        billingCycle === value ? 'bg-white text-slate-900' : 'text-white/50 hover:text-white',
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
                    >
                        {tiers.map((tier) => {
                            const featured = tier.isFeatured;
                            const priceId = tier.priceId[billingCycle];
                            const formattedTotal = pricePreviews[priceId]?.total;
                            return (
                                <motion.div
                                    key={tier.slug}
                                    variants={fadeUp}
                                    className="relative rounded-2xl p-8 flex flex-col border"
                                    style={{
                                        background: featured ? 'rgb(var(--brand-600) / 0.08)' : 'rgba(255,255,255,0.025)',
                                        borderColor: featured ? 'rgb(var(--brand-600) / 0.5)' : 'rgba(255,255,255,0.08)',
                                    }}
                                >
                                    {featured && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold text-white whitespace-nowrap"
                                            style={{ background: 'linear-gradient(135deg,rgb(var(--brand-700)),rgb(var(--brand2-700)))' }}>
                                            <Star className="w-3 h-3 fill-white" /> Most Popular
                                        </div>
                                    )}

                                    <h3 className="text-white font-bold text-xl mb-1.5">{tier.name}</h3>
                                    <p className="text-white/40 text-sm mb-6 min-h-[40px]">{tier.description}</p>

                                    <div className="mb-6 flex items-baseline gap-2 min-h-[44px]">
                                        {formattedTotal ? (
                                            <>
                                                <span className="text-4xl font-black text-white">{formattedTotal}</span>
                                                <span className="text-white/35 text-sm font-medium">/{billingCycle === 'month' ? 'mo' : 'yr'}</span>
                                            </>
                                        ) : (
                                            <span className="text-white/30 text-sm">{previewError ? 'Price unavailable' : 'Loading price…'}</span>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-3 mb-8">
                                        {tier.features.map((feature) => (
                                            <div key={feature} className="flex items-start gap-2.5 text-white/70 text-sm">
                                                <Check className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => openCheckout(tier)}
                                        disabled={checkoutTier === tier.slug}
                                        className={cn(
                                            'group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:-translate-y-px disabled:opacity-60 disabled:hover:translate-y-0',
                                            featured
                                                ? 'text-white hover:opacity-90 hover:shadow-2xl hover:shadow-brand-500/25'
                                                : 'text-white/70 border border-white/15 hover:bg-white/5 hover:text-white'
                                        )}
                                        style={featured ? { background: 'linear-gradient(135deg,rgb(var(--brand-700)),rgb(var(--brand2-700)))' } : undefined}
                                    >
                                        {checkoutTier === tier.slug ? 'Opening…' : 'Subscribe'}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* ── Live Timeline ─────────────────────────────────────────────── */}
            <section className="py-20 bg-brand-tint">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ActivityShowcase />
                </div>
            </section>

            {/* ── FAQ ──────────────────────────────────────────────────────── */}
            <section id="faq" className="py-24 bg-brand-tint">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-brand-400" />
                            <span className="text-brand-600 text-xs font-bold uppercase tracking-widest">FAQ</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
                            Questions.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-slate-500 text-lg">
                            Still unsure?{' '}
                            <a href="mailto:hello@lumenialab.com" className="text-brand-600 hover:underline font-medium">
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
                                        <ChevronDown className="w-5 h-5 text-brand-500" />
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
            <section id="contact" className="py-24" style={{ background: 'rgb(var(--brand-tint))' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6">

                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-brand-400" />
                            <span className="text-brand-600 text-xs font-bold uppercase tracking-widest">Get in touch</span>
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
                                { icon: Mail,    title: 'Email us',      value: 'hello@lumenialab.com',   sub: 'We reply within 24 hours', color: 'rgb(var(--brand-600))', bg: 'rgb(var(--brand-50))' },
                                { icon: Phone,   title: 'Call us',       value: '+92 335 445 5494',       sub: 'Available 24 hours',        color: 'rgb(var(--brand2-600))', bg: 'rgb(var(--brand2-50))' },
                                { icon: MapPin,  title: 'Headquarters',  value: 'Lahore, Pakistan',        sub: 'Lumenia Lab Pvt. Ltd.',     color: '#475569', bg: '#F1F5F9' },
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
                                        className="mt-6 text-brand-600 text-sm font-semibold hover:underline"
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
                                                           text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
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
                                                           text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
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
                                                           text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
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
                                                           text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
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
                                                       text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
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
                                                       text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition resize-none"
                                        />
                                        {contact.errors.message && <p className="text-red-500 text-xs mt-1">{contact.errors.message}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={contact.processing}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white
                                                   text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                                        style={{ background: 'linear-gradient(135deg,rgb(var(--brand-700)),rgb(var(--brand2-700)))' }}
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
                     style={{ background: 'linear-gradient(155deg,rgb(var(--brand-ink2)) 0%,rgb(var(--brand-ink)) 100%)' }}>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[700px] h-[500px] rounded-full"
                         style={{ background: 'radial-gradient(ellipse, rgb(var(--brand-600) / 0.2) 0%, transparent 65%)', filter: 'blur(60px)' }} />
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
                                         hover:shadow-2xl hover:shadow-brand-500/30 hover:-translate-y-0.5"
                              style={{ background: 'linear-gradient(135deg,rgb(var(--brand-700)),rgb(var(--brand2-700)))' }}>
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

            <SubscribeAuthModal
                open={authModalOpen}
                onClose={() => { setAuthModalOpen(false); setPendingTier(null); }}
                onAuthenticated={() => router.reload({ only: ['auth', 'organization'] })}
            />
        </div>
    );
}
