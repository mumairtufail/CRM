import SiteHeader from '@/Components/Common/SiteHeader';
import SiteFooter from '@/Components/Common/SiteFooter';
import SeoHead from '@/Components/Common/SeoHead';

const RELEASES = [
    {
        period: 'July 2026',
        items: [
            'Added an AI chatbot widget you can enable on the landing page, backed by an admin-editable knowledge base, custom system prompt, and a log of recorded conversations.',
            'Reworked the Settings page navigation so the sidebar stays in view while you scroll through longer settings screens.',
            'Launched four free, no-signup business tools: Invoice Generator, Proposal & Contract Writer, UTM Link Builder, and Email Signature Generator.',
            'Rebuilt the lead capture Form Builder with a compact split-pane layout and a proper custom-fields configuration dialog.',
            'Replaced link-based email verification with a 6-digit code, including a countdown and resend cooldown.',
            'Added a built-in blog with AI-assisted drafting, SEO suggestions, and an auto-generated sitemap.',
            'Added bulk-delete with confirmation dialogs for workspaces and blog posts in the admin panel.',
        ],
    },
];

export default function Changelog() {
    return (
        <>
            <SeoHead
                title="Changelog · Lumenia CRM"
                description="Recent product updates and improvements to Lumenia CRM: new features, workflow changes, and what shipped each month."
                path="/changelog"
            />

            <div className="min-h-screen bg-[rgb(var(--brand-tint))] font-sans antialiased text-slate-800">
                <SiteHeader />

                <main className="max-w-2xl mx-auto px-6 py-16">
                    <p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-3">Product updates</p>
                    <h1 className="text-4xl font-black text-slate-900 mb-4">Changelog</h1>
                    <p className="text-slate-500 text-lg mb-14">
                        What's shipped recently in Lumenia CRM. Bug fixes and small polish passes aren't listed
                        individually here — this covers the changes that affect how you use the product.
                    </p>

                    <div className="space-y-14">
                        {RELEASES.map(({ period, items }) => (
                            <section key={period}>
                                <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-3">
                                    <span className="h-px w-8 bg-brand-400" />
                                    {period}
                                </h2>
                                <ul className="space-y-4">
                                    {items.map((item, idx) => (
                                        <li key={idx} className="flex gap-3 text-slate-700 leading-relaxed">
                                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>
                </main>

                <SiteFooter />
            </div>
        </>
    );
}
