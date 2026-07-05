import { Link, usePage } from '@inertiajs/react';
import { LogoMark } from '@/Components/Common/Logo';

/**
 * Shared marketing-site footer. Used by the landing page, blog, free tools,
 * and legal pages so the link set (and fixes to it) only need to live in one place.
 */
export default function SiteFooter({ className = '' }) {
    const { props, url } = usePage();
    const latestBlogs = props.latestBlogs || [];
    const isHome = !url || url === '/' || url.startsWith('/?');
    const homeAnchor = (hash) => (isHome ? hash : `/${hash}`);

    const columns = [
        {
            heading: 'Product',
            links: [
                { label: 'Features', href: homeAnchor('#features') },
                { label: 'Pricing', href: homeAnchor('#pricing') },
                { label: 'Products & Services', href: '/products', internal: true },
                { label: 'FAQ', href: homeAnchor('#faq') },
                { label: 'Changelog', href: '/changelog', internal: true },
            ],
        },
        {
            heading: 'Free Tools',
            links: [
                { label: 'Email Signature', href: '/tools/email-signature-generator', internal: true },
                { label: 'Invoice Generator', href: '/tools/invoice-generator', internal: true },
                { label: 'Proposal Writer', href: '/tools/proposal-writer', internal: true },
                { label: 'UTM Builder', href: '/tools/utm-builder', internal: true },
                { label: 'All Free Tools', href: '/tools', internal: true },
            ],
        },
        {
            heading: 'Account',
            links: [
                { label: 'Sign In', href: '/login', internal: true },
                { label: 'Register', href: '/register', internal: true },
                { label: 'Support', href: 'mailto:hello@lumenialab.com' },
                { label: 'Contact', href: homeAnchor('#contact') },
            ],
        },
        {
            heading: 'Legal',
            links: [
                { label: 'Privacy Policy', href: '/privacy-policy', internal: true },
                { label: 'Terms & Conditions', href: '/terms-and-conditions', internal: true },
                { label: 'Refund & Return Policy', href: '/refund-policy', internal: true },
                { label: 'Shipping & Service Policy', href: '/shipping-policy', internal: true },
            ],
        },
    ];

    return (
        <footer style={{ background: '#030208' }} className={`border-t border-white/5 w-full ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2.5 mb-4">
                            <LogoMark size={32} />
                            <span className="font-extrabold text-white text-[17px] tracking-tight leading-none">Lumenia CRM</span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            A CRM for sales teams that actually want to use their CRM. By Lumenia Lab Pvt. Ltd.
                        </p>
                    </div>

                    {columns.map(({ heading, links }) => (
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

                    <div>
                        <div className="text-white font-semibold text-sm mb-4">Latest Blogs</div>
                        <ul className="space-y-2.5">
                            <li>
                                <Link href="/blog" className="text-violet-400 hover:text-white text-sm font-semibold transition-colors block mb-1">Our Blog</Link>
                            </li>
                            {latestBlogs && latestBlogs.length > 0 ? (
                                latestBlogs.map((b) => (
                                    <li key={b.slug}>
                                        <Link href={`/blog/${b.slug}`} className="text-slate-600 hover:text-white text-sm transition-colors block truncate max-w-[185px]" title={b.title}>
                                            {b.title}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li className="text-slate-700 text-sm italic">No articles yet</li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-slate-700 text-sm">
                        © {new Date().getFullYear()} Lumenia Lab Pvt. Ltd. All rights reserved.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
                        <span className="text-slate-700 text-sm">Lahore, Pakistan</span>
                        <a href="tel:+923354455494" className="text-slate-700 hover:text-white text-sm transition-colors">+92 335 445 5494</a>
                        <a href="mailto:hello@lumenialab.com" className="text-slate-700 hover:text-white text-sm transition-colors">
                            hello@lumenialab.com
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
