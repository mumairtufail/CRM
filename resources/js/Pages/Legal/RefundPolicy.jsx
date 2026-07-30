import SiteHeader from '@/Components/Common/SiteHeader';
import SiteFooter from '@/Components/Common/SiteFooter';
import SeoHead from '@/Components/Common/SeoHead';

const EFFECTIVE_DATE = 'July 5, 2026';

export default function RefundPolicy() {
    return (
        <>
            <SeoHead
                title="Refund & Return Policy · Lumenia CRM"
                description="Refund, cancellation, and return terms for Lumenia CRM subscriptions."
                path="/refund-policy"
            />

            <div className="min-h-screen bg-[rgb(var(--brand-tint))] font-sans antialiased text-slate-800">
                <SiteHeader />

                <main className="max-w-3xl mx-auto px-6 py-16">
                    <p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-3">Legal</p>
                    <h1 className="text-4xl font-black text-slate-900 mb-3">Refund & Return Policy</h1>
                    <p className="text-slate-500 text-sm mb-12">Effective date: {EFFECTIVE_DATE}</p>

                    <div className="prose-legal space-y-10 text-slate-700 leading-relaxed">
                        <section>
                            <p>
                                Lumenia CRM is a subscription software service — there is no physical product to return.
                                This policy explains when a subscription charge is eligible for a refund.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">1. First-time subscribers — 7-day guarantee</h2>
                            <p>
                                If you subscribe to a paid plan (Starter, Pro, or Premium) for the first time and decide it's
                                not right for you, email <a href="mailto:hello@lumenialab.com" className="text-brand-600 hover:underline">hello@lumenialab.com</a>{' '}
                                within 7 days of your first payment and we'll refund that charge in full to your original
                                payment method. This guarantee applies once per organization.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Renewal charges</h2>
                            <p>
                                Subscriptions renew automatically at the end of each billing cycle. We don't issue refunds
                                for renewal charges on plans you continued to use after the 7-day window in Section 1,
                                including partially-used billing periods. You can cancel auto-renewal at any time from
                                account settings to stop future charges — cancellation takes effect at the end of the
                                current paid period, and you keep access until then.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Plan changes</h2>
                            <p>
                                If you upgrade mid-cycle, we charge the prorated difference immediately. If you downgrade,
                                the new (lower) rate applies from your next renewal — we don't refund the difference for
                                the current period.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Billing errors and duplicate charges</h2>
                            <p>
                                If you were charged in error — for example, a duplicate charge, or a charge after you
                                cancelled — contact us with your workspace name and payment date and we'll refund the
                                incorrect charge in full once verified, typically within 5 business days.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Free tools and free plan</h2>
                            <p>
                                Our free tools (invoice generator, proposal writer, UTM builder, email signature generator)
                                and any free-tier workspace usage are provided at no cost, so no refund applies to them.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">6. How refunds are paid</h2>
                            <p>
                                Approved refunds are returned to the original payment method through our payment gateway.
                                Processing time depends on your bank or card issuer, typically 5–10 business days after
                                we approve the refund.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Requesting a refund</h2>
                            <p>
                                Email <a href="mailto:hello@lumenialab.com" className="text-brand-600 hover:underline">hello@lumenialab.com</a>{' '}
                                or call <a href="tel:+923354455494" className="text-brand-600 hover:underline">+92 335 445 5494</a>{' '}
                                with your workspace name, the email on the account, and the reason for the request. We
                                reply to every refund request within one business day.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Contact us</h2>
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
