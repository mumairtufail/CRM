import SiteHeader from '@/Components/Common/SiteHeader';
import SiteFooter from '@/Components/Common/SiteFooter';
import SeoHead from '@/Components/Common/SeoHead';

const EFFECTIVE_DATE = 'July 5, 2026';

export default function TermsAndConditions() {
    return (
        <>
            <SeoHead
                title="Terms & Conditions · Lumenia CRM"
                description="The terms that govern use of Lumenia CRM, provided by Lumenia Lab Pvt. Ltd."
                path="/terms-and-conditions"
            />

            <div className="min-h-screen bg-[rgb(var(--brand-tint))] font-sans antialiased text-slate-800">
                <SiteHeader />

                <main className="max-w-3xl mx-auto px-6 py-16">
                    <p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-3">Legal</p>
                    <h1 className="text-4xl font-black text-slate-900 mb-3">Terms & Conditions</h1>
                    <p className="text-slate-500 text-sm mb-12">Effective date: {EFFECTIVE_DATE}</p>

                    <div className="prose-legal space-y-10 text-slate-700 leading-relaxed">
                        <section>
                            <p>
                                These Terms & Conditions ("Terms") govern access to and use of Lumenia CRM, a software
                                product owned and operated by Lumenia Lab Pvt. Ltd. ("Lumenia Lab", "we", "us"), including
                                the marketing website, the application, the free tools under <code>/tools</code>, and any
                                related services. By creating a workspace or using the site, you agree to these Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">1. The service</h2>
                            <p>
                                Lumenia CRM is sold as a subscription (SaaS), with a free tier and paid plans above it.
                                Your workspace and the features available to it depend on the plan you choose, as
                                described on our{' '}
                                <a href="/#pricing" className="text-brand-600 hover:underline">pricing page</a> and our{' '}
                                <a href="/products" className="text-brand-600 hover:underline">Products & Services page</a>.
                                We may add, change, or retire individual features as the product evolves; we won't remove
                                a feature you're actively paying for without reasonable notice.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Accounts and eligibility</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>You must be at least 18 years old and able to enter a binding contract to register.</li>
                                <li>You're responsible for the accuracy of the information you provide and for activity under your workspace, including team members you invite.</li>
                                <li>You're responsible for keeping your login credentials confidential.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Subscriptions and billing</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Paid plans are billed monthly or yearly in advance, in the currency and amount shown at checkout.</li>
                                <li>Subscriptions renew automatically until cancelled from your account settings.</li>
                                <li>Prices may change; we'll notify active subscribers at least 30 days before a price increase takes effect on their next renewal.</li>
                                <li>Refunds are handled under our <a href="/refund-policy" className="text-brand-600 hover:underline">Refund & Return Policy</a>.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Acceptable use</h2>
                            <p className="mb-3">You agree not to use Lumenia CRM to:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Send unsolicited bulk email, spam, or WhatsApp messages that violate Meta's Business Messaging Policy.</li>
                                <li>Upload unlawful, infringing, or fraudulent content, or data you don't have the right to store.</li>
                                <li>Attempt to breach, probe, or disrupt the security of the platform, or access another workspace's data.</li>
                                <li>Resell or sublicense the service without a written agreement with us.</li>
                            </ul>
                            <p className="mt-3">
                                We may suspend or terminate a workspace that violates these rules, with notice where practical.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Your data</h2>
                            <p>
                                You own the leads, contacts, invoices, and other content you store in your workspace. We
                                process it only to provide the service, as described in our{' '}
                                <a href="/privacy-policy" className="text-brand-600 hover:underline">Privacy Policy</a>.
                                You're responsible for having the right to collect and store the data you put into the CRM
                                (for example, consent for the leads and contacts you import).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Free tools</h2>
                            <p>
                                The free tools (invoice generator, proposal writer, UTM builder, email signature generator)
                                are provided at no cost and without an account. We may add usage limits or discontinue an
                                individual free tool at our discretion; we'll keep any documents you've already generated
                                and downloaded unaffected.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Intellectual property</h2>
                            <p>
                                Lumenia CRM's software, design, and branding are owned by Lumenia Lab Pvt. Ltd. Using the
                                service doesn't transfer any of that intellectual property to you.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Service availability and liability</h2>
                            <p>
                                We work to keep Lumenia CRM available and reliable but don't guarantee uninterrupted
                                service. To the extent permitted by law, Lumenia Lab's liability for any claim relating to
                                the service is limited to the amount you paid us in the 12 months before the claim arose.
                                We're not liable for indirect or consequential losses.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Cancellation and termination</h2>
                            <p>
                                You can cancel your subscription at any time from account settings; cancellation takes
                                effect at the end of the current billing period. We may terminate an account for
                                non-payment or a serious breach of these Terms, after reasonable notice where practical.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Governing law</h2>
                            <p>
                                These Terms are governed by the laws of Pakistan. Any dispute arising from these Terms
                                will be subject to the exclusive jurisdiction of the courts of Lahore, Pakistan.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">11. Contact us</h2>
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
