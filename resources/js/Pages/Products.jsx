import { Head, Link } from '@inertiajs/react';
import {
    Users, Mail, Target, FileText, Cpu, Briefcase, MessageSquare, Wrench, Check,
} from 'lucide-react';
import SiteHeader from '@/Components/Common/SiteHeader';
import SiteFooter from '@/Components/Common/SiteFooter';

const PRODUCTS = [
    {
        icon: Users,
        title: 'Lead Management',
        plan: 'All plans',
        description: 'Add leads manually, import from CSV, or pull them in with AI prospecting. Every lead gets its own timeline, tags, and activity log.',
    },
    {
        icon: Target,
        title: 'Sales Pipeline',
        plan: 'All plans',
        description: 'A Kanban board for your deals — drag cards between stages, filter by tag or status, and see instantly what\'s stuck.',
    },
    {
        icon: FileText,
        title: 'Client Invoicing',
        plan: 'All plans',
        description: 'Create and send an invoice in under a minute, mark it paid, and track outstanding balances — no separate invoicing tool needed.',
    },
    {
        icon: Briefcase,
        title: 'Clients & Projects',
        plan: 'All plans',
        description: 'Convert a lead into a client in one click, then manage their projects, tasks, and files from the same workspace.',
    },
    {
        icon: Mail,
        title: 'Email Campaigns',
        plan: 'Pro & Premium',
        description: 'Write a campaign once, send it to your whole list, and let automatic follow-ups go out to anyone who didn\'t open it.',
    },
    {
        icon: Cpu,
        title: 'AI Prospecting',
        plan: 'All plans',
        description: 'Describe your ideal customer in plain language and let AI find and import matching leads directly into your workspace.',
    },
    {
        icon: MessageSquare,
        title: 'WhatsApp Campaigns & Automation',
        plan: 'Premium',
        description: 'Send official WhatsApp Business campaigns and let an auto-response bot answer common questions from your own FAQ.',
    },
    {
        icon: Wrench,
        title: 'Free Business Tools',
        plan: 'Free, no account',
        description: 'Invoice Generator, Proposal & Contract Writer, UTM Link Builder, and Email Signature Generator — usable by anyone at no cost.',
    },
];

const PLANS = [
    { name: 'Basic', price: '$29/mo', blurb: 'Up to 500 leads, 1 pipeline, basic invoicing.' },
    { name: 'Pro', price: '$79/mo', blurb: 'Unlimited leads & pipelines, email campaigns, advanced reports.' },
    { name: 'Premium', price: '$149/mo', blurb: 'Everything in Pro, plus WhatsApp campaigns and automation.' },
];

export default function Products() {
    return (
        <>
            <Head>
                <title>Products & Services · Lumenia CRM</title>
                <meta name="description" content="The products and services Lumenia Lab offers as part of Lumenia CRM: lead management, pipelines, invoicing, campaigns, WhatsApp automation, and free business tools." />
            </Head>

            <div className="min-h-screen bg-[rgb(var(--brand-tint))] font-sans antialiased text-slate-800">
                <SiteHeader />

                <main className="max-w-6xl mx-auto px-6 py-16">
                    <div className="max-w-2xl mb-14">
                        <p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-3">What we offer</p>
                        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4">Products & Services</h1>
                        <p className="text-slate-500 text-lg">
                            Lumenia CRM is sold by Lumenia Lab Pvt. Ltd. as a monthly or yearly subscription. Every
                            workspace includes the core CRM below; higher tiers unlock campaigns and WhatsApp automation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                        {PRODUCTS.map(({ icon: Icon, title, plan, description }) => (
                            <div key={title} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-3">
                                <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-500">{plan}</span>
                                </div>
                                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-200 pt-14">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Subscription plans</h2>
                        <p className="text-slate-500 mb-8">Cancel any time. See full plan details on our{' '}
                            <a href="/#pricing" className="text-brand-600 hover:underline">pricing section</a>.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {PLANS.map(({ name, price, blurb }) => (
                                <div key={name} className="bg-white border border-slate-200 rounded-2xl p-6">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <h3 className="font-bold text-slate-900">{name}</h3>
                                        <span className="text-brand-600 font-extrabold">{price}</span>
                                    </div>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{blurb}</p>
                                    <Link href="/register" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline">
                                        <Check className="w-4 h-4" /> Get started
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                <SiteFooter />
            </div>
        </>
    );
}
