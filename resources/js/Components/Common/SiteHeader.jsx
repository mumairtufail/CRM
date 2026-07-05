import { Link } from '@inertiajs/react';
import Logo from '@/Components/Common/Logo';

/**
 * Shared lightweight nav bar for standalone marketing pages (blog, legal, tools).
 * The landing page itself keeps its own richer nav (scroll-spy, mobile drawer).
 */
export default function SiteHeader({ active }) {
    const navItems = [
        { label: 'Home', href: '/', key: 'home' },
        { label: 'Blog', href: '/blog', key: 'blog' },
    ];

    return (
        <header className="sticky top-0 z-50 bg-[rgb(var(--brand-tint))]/85 backdrop-blur-md border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Logo size={32} showText={true} text="LumeniaCRM" textClassName="text-[17px] font-extrabold" />
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-[14px] font-semibold text-slate-600">
                    {navItems.map(({ label, href, key }) => (
                        <Link
                            key={key}
                            href={href}
                            className={key === active ? 'text-brand-600' : 'hover:text-brand-600 transition-colors'}
                        >
                            {label}
                        </Link>
                    ))}
                    <Link href="/login" className="hover:text-brand-600 transition-colors">Sign in</Link>
                    <Link
                        href="/register"
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-[13px] font-bold shadow-sm shadow-brand-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Get Started
                    </Link>
                </nav>
            </div>
        </header>
    );
}
