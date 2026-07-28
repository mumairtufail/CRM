import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import SiteHeader from '@/Components/Common/SiteHeader';
import SiteFooter from '@/Components/Common/SiteFooter';

export default function CheckoutWelcome() {
    return (
        <>
            <Head>
                <title>You're in · Lumenia CRM</title>
                <meta name="robots" content="noindex" />
            </Head>

            <div className="min-h-screen flex flex-col bg-[rgb(var(--brand-tint))] font-sans antialiased text-slate-800">
                <SiteHeader />

                <main className="flex-1 flex items-center justify-center px-6 py-20">
                    <div className="max-w-md w-full text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-3">Subscription confirmed</h1>
                        <p className="text-slate-500 leading-relaxed mb-10">
                            Thanks for subscribing. Paddle has emailed you a receipt.
                            Sign in (or create your workspace, if you haven't yet) to get started.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/register"
                                className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
                                style={{ background: 'linear-gradient(135deg,rgb(var(--brand-700)),rgb(var(--brand2-700)))' }}
                            >
                                Create your workspace
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-white transition-colors"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>
                </main>

                <SiteFooter />
            </div>
        </>
    );
}
