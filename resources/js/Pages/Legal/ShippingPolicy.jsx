import { Head } from '@inertiajs/react';
import SiteHeader from '@/Components/Common/SiteHeader';
import SiteFooter from '@/Components/Common/SiteFooter';

const EFFECTIVE_DATE = 'July 5, 2026';

export default function ShippingPolicy() {
    return (
        <>
            <Head>
                <title>Shipping & Service Delivery Policy · Lumenia CRM</title>
                <meta name="description" content="How and when Lumenia CRM access and support are delivered after purchase." />
            </Head>

            <div className="min-h-screen bg-[rgb(var(--brand-tint))] font-sans antialiased text-slate-800">
                <SiteHeader />

                <main className="max-w-3xl mx-auto px-6 py-16">
                    <p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-3">Legal</p>
                    <h1 className="text-4xl font-black text-slate-900 mb-3">Shipping & Service Delivery Policy</h1>
                    <p className="text-slate-500 text-sm mb-12">Effective date: {EFFECTIVE_DATE}</p>

                    <div className="prose-legal space-y-10 text-slate-700 leading-relaxed">
                        <section>
                            <p>
                                Lumenia CRM is a digital service — nothing is physically shipped. This policy explains
                                how access to the product is delivered once you sign up or subscribe, and how ongoing
                                service and support work.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Account activation</h2>
                            <p>
                                Registration is instant: create a workspace at{' '}
                                <a href="/register" className="text-brand-600 hover:underline">/register</a>, verify
                                your email with the 6-digit code we send, and your workspace is ready to use immediately —
                                no waiting period.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Paid plan delivery</h2>
                            <p>
                                When you subscribe to Basic, Pro, or Premium, the plan's modules (email campaigns,
                                WhatsApp automation, advanced reporting, etc.) are unlocked on your workspace as soon as
                                the payment gateway confirms your payment — typically within a few seconds, and always
                                within the same business day. You'll receive an email receipt for every successful charge.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Free tools</h2>
                            <p>
                                The free tools under <code>/tools</code> (invoice generator, proposal writer, UTM
                                builder, email signature generator) run in your browser — documents you create are
                                available to download immediately, with no account or delivery delay.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Downtime and maintenance</h2>
                            <p>
                                We occasionally perform maintenance that may briefly interrupt access. Where possible we
                                schedule this outside business hours in Pakistan Standard Time (UTC+5) and notify
                                affected workspaces in advance by email.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Support response times</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Contact-form and email inquiries: within 1 business day.</li>
                                <li>In-app support tickets on Basic and Pro plans: within 1–2 business days.</li>
                                <li>Priority support on the Premium plan: within 4 business hours, Monday–Saturday.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Contact us</h2>
                            <p>
                                Lumenia Lab Pvt. Ltd. — Lahore, Punjab, Pakistan<br />
                                Email: <a href="mailto:hello@lumenialab.com" className="text-brand-600 hover:underline">hello@lumenialab.com</a><br />
                                Phone: <a href="tel:+923354455494" className="text-brand-600 hover:underline">+92 335 445 5494</a>
                            </p>
                        </section>
                    </div>
                </main>

                <SiteFooter />
            </div>
        </>
    );
}
