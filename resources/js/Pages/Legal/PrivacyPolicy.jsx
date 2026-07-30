import SiteHeader from '@/Components/Common/SiteHeader';
import SiteFooter from '@/Components/Common/SiteFooter';
import SeoHead from '@/Components/Common/SeoHead';

const EFFECTIVE_DATE = 'July 5, 2026';

export default function PrivacyPolicy() {
    return (
        <>
            <SeoHead
                title="Privacy Policy · Lumenia CRM"
                description="How Lumenia Lab Pvt. Ltd. collects, uses, stores, and protects data for Lumenia CRM customers and website visitors."
                path="/privacy-policy"
            />

            <div className="min-h-screen bg-[rgb(var(--brand-tint))] font-sans antialiased text-slate-800">
                <SiteHeader />

                <main className="max-w-3xl mx-auto px-6 py-16">
                    <p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-3">Legal</p>
                    <h1 className="text-4xl font-black text-slate-900 mb-3">Privacy Policy</h1>
                    <p className="text-slate-500 text-sm mb-12">Effective date: {EFFECTIVE_DATE}</p>

                    <div className="prose-legal space-y-10 text-slate-700 leading-relaxed">
                        <section>
                            <p>
                                Lumenia Lab Pvt. Ltd. ("Lumenia Lab", "we", "us") operates Lumenia CRM, a subscription
                                software product for managing leads, sales pipelines, email and WhatsApp campaigns,
                                invoicing, and client projects. This policy explains what data we collect through our
                                website and application at {typeof window !== 'undefined' ? window.location.host : 'lumenialab.com'},
                                why we collect it, and what control you have over it.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Information we collect</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Account data</strong> — name, work email, phone number, and company name provided when you register a workspace.</li>
                                <li><strong>Billing data</strong> — plan selection and transaction records. Card and payment method details are collected and stored directly by our payment gateway processor, not on our servers.</li>
                                <li><strong>Customer content</strong> — leads, contacts, emails, WhatsApp messages, invoices, and files you or your team upload into your workspace to use the CRM.</li>
                                <li><strong>Usage data</strong> — pages visited, feature usage, browser type, and IP address, collected automatically to keep the service secure and to fix bugs.</li>
                                <li><strong>Communications</strong> — messages you send us through the contact form, email, or support tickets.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">2. How we use it</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>To provide, maintain, and secure your workspace and the features on your plan.</li>
                                <li>To process subscription payments and send billing receipts.</li>
                                <li>To send transactional email (verification codes, invoice notifications, password resets) and, where you've agreed, product updates.</li>
                                <li>To respond to support requests and contact-form messages.</li>
                                <li>To detect abuse, enforce our Terms & Conditions, and comply with legal obligations.</li>
                            </ul>
                            <p className="mt-3">We do not sell customer data to third parties.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Who we share data with</h2>
                            <p className="mb-3">We share data only with service providers needed to run Lumenia CRM, under contractual confidentiality obligations:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Payment gateway and card processors, to complete subscription charges.</li>
                                <li>Cloud hosting and storage providers, to run the application and store files you upload.</li>
                                <li>Email delivery providers (SMTP), to send transactional and campaign email on your behalf.</li>
                                <li>WhatsApp Business Platform (Meta), when you use WhatsApp automation features on the Premium plan.</li>
                            </ul>
                        </section>

                        <section id="security">
                            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Security</h2>
                            <p>
                                Every workspace is isolated at the database level so one customer's leads, invoices, and
                                messages are never visible to another. Passwords are hashed, admin actions are logged, and
                                access to production data is restricted to engineers who need it to operate the service.
                                No online system is 100% secure, but we take reasonable technical and organizational
                                measures to protect your data against unauthorized access, alteration, or loss.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Data retention</h2>
                            <p>
                                We keep account and customer content for as long as your workspace is active. If you close
                                your account, we delete your workspace data within 30 days, except where we're required to
                                keep billing records for tax or accounting purposes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Your rights</h2>
                            <p>
                                You can review, correct, export, or delete the data in your workspace at any time from
                                your account settings. To request a full export or deletion of your account, email{' '}
                                <a href="mailto:hello@lumenialab.com" className="text-brand-600 hover:underline">hello@lumenialab.com</a>{' '}
                                and we'll act on it within a reasonable timeframe.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Cookies</h2>
                            <p>
                                We use essential cookies to keep you signed in and to remember your session. We use
                                Google Analytics to understand aggregate traffic to our marketing pages; this does not
                                identify you personally.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Changes to this policy</h2>
                            <p>
                                If we make material changes to this policy, we'll update the effective date above and,
                                where required, notify account owners by email.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Contact us</h2>
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
