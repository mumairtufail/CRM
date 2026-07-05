import { Head, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Mail, FileText, ArrowRight, Award, HelpCircle, ChevronRight, Menu, X, PenTool, Link2 } from 'lucide-react'
import Logo, { LogoMark } from '@/Components/Common/Logo'
import SiteFooter from '@/Components/Common/SiteFooter'

export default function Hub({ latestBlogs = [] }) {
  const [activeFaq, setActiveFaq] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: 'How it works', href: '/#flow'    },
    { label: 'Features',     href: '/#modules' },
    { label: 'Pricing',      href: '/#pricing' },
    { label: 'Contact',      href: '/#contact' },
  ]

  const tools = [
    {
      id: 'email-signature',
      title: 'Free Email Signature Generator',
      description: 'Create a professional, HTML-formatted email signature for Gmail, Outlook, Apple Mail, and more in seconds. Customize templates, logos, and social links.',
      icon: Mail,
      href: '/tools/email-signature-generator',
      badge: 'Popular',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      cta: 'Create Email Signature',
    },
    {
      id: 'invoice-generator',
      title: 'Free Standalone Invoice Generator',
      description: 'Build, customize, and download professional PDF invoices on the fly. No account required. Calculate taxes, add line items, and brand with your logo.',
      icon: FileText,
      href: '/tools/invoice-generator',
      badge: 'New',
      badgeColor: 'bg-brand-50 text-brand-700 border-brand-100',
      cta: 'Create Free Invoice',
    },
    {
      id: 'proposal-writer',
      title: 'B2B Proposal & Contract Writer',
      description: 'Draft premium client proposals, commercial offers, and freelance contracts in your browser. Outline project deliverables, pricing, and download print-ready PDFs.',
      icon: PenTool,
      href: '/tools/proposal-writer',
      badge: 'Bestseller',
      badgeColor: 'bg-brand2-50 text-brand2-700 border-brand2-100',
      cta: 'Write Proposal',
    },
    {
      id: 'utm-builder',
      title: 'Campaign UTM Link Builder',
      description: 'Build trackable marketing campaign URLs with utm_source, utm_medium, and utm_campaign tags for precise Google Analytics and CRM lead tracking.',
      icon: Link2,
      href: '/tools/utm-builder',
      badge: 'Marketing',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-100',
      cta: 'Generate Link',
    },
    {
      id: 'aeo-grader',
      title: 'AEO Grader (AI Search Sensor)',
      description: 'Find out how well your website is optimized for AI search engines like Perplexity, ChatGPT Search, Gemini, and Claude. Get optimization tips.',
      icon: Award,
      href: '#',
      badge: 'Coming Soon',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-100',
      cta: 'Scan website (Soon)',
      disabled: true,
    },
  ]

  const faqs = [
    {
      q: "Are these business tools really 100% free?",
      a: "Yes, completely free. There are no credit cards, hidden costs, or trials. We offer these tools to help startup founders, marketing teams, and freelancers grow their business, and to introduce them to the full suite of Lumenia CRM features."
    },
    {
      q: "Do I need to create a Lumenia CRM account to use them?",
      a: "No account is required to generate signatures, write cold emails, or build invoices. However, connecting these tools to a free Lumenia CRM workspace allows you to save your data, track invoice payment statuses, and send campaigns directly."
    },
    {
      q: "Will you show ads or add watermarks to my signatures or invoices?",
      a: "We do not show third-party ads. Our standard free email signatures include a very small, clean link to help support the tool, which you can easily customize or hide."
    },
  ]

  return (
    <>
      <Head>
        <title>Free Business & Sales Tools · Lumenia CRM</title>
        <meta name="description" content="Discover free B2B business tools by Lumenia CRM. Design HTML email signatures, generate PDF invoices, scan for AEO/AI engine optimization, and grow your traffic." />
        <meta property="og:title" content="Free Sales & Growth Tools by Lumenia CRM" />
        <meta property="og:description" content="Level up your sales process with free high-value tools." />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-[rgb(var(--brand-tint))] font-sans antialiased text-slate-800 flex flex-col justify-between">
        {/* Header/Nav */}
        <nav className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                              style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}>
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
                <div className="md:hidden border-t border-white/10 px-4 py-4 space-y-1"
                     style={{ background: 'rgba(10,8,18,0.97)' }}>
                    {navLinks.map(({ label, href }) => (
                        <a key={label} href={href} onClick={() => setMobileOpen(false)}
                           className="block py-2.5 text-white/75 hover:text-white text-sm font-medium">{label}</a>
                    ))}
                    <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                        <Link href="/login"
                              className="block py-3 rounded-xl text-center text-sm font-medium text-white/75 border border-white/15 hover:bg-white/5">
                            Sign In
                        </Link>
                        <Link href="/register"
                              className="block py-3 rounded-xl text-center text-sm font-bold text-white"
                              style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}>
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </nav>

        {/* Spacer for sticky header */}
        <div className="h-16 w-full shrink-0" />

        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-transparent relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full opacity-[0.03] pointer-events-none blur-3xl bg-brand-600" />
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                Free Sales & Growth <span className="bg-gradient-to-r from-brand-600 to-brand2-600 bg-clip-text text-transparent">Power Tools</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
                Accelerate your sales workflow, create professional brand assets, and optimize your organic outreach with zero cost.
              </p>
            </div>
            <img
              src="/images/marketing/prospecting-data.jpg"
              alt="Analytics dashboard showing growth metrics"
              loading="lazy"
              className="hidden lg:block w-full aspect-[4/3] object-cover rounded-3xl border border-slate-100 shadow-sm"
            />
          </div>
        </section>

        {/* Tools Grid */}
        <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <div
                  key={tool.id}
                  className={`bg-white border rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 shadow-sm ${
                    tool.disabled
                      ? 'border-slate-100 opacity-75'
                      : 'border-slate-200 hover:shadow-md hover:-translate-y-0.5 group'
                  }`}
                >
                  <div>
                    {/* Header line */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-3.5 rounded-xl ${tool.disabled ? 'bg-slate-50 text-slate-400' : 'bg-brand-50 text-brand-600'}`}>
                        <Icon size={24} />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-brand-600 transition-colors">
                      {tool.title}
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed font-normal mb-8">
                      {tool.description}
                    </p>
                  </div>

                  <div>
                    {tool.disabled ? (
                      <span className="w-full py-3 bg-slate-50 border border-slate-100 text-slate-400 rounded-xl text-[13px] font-bold inline-flex items-center justify-center gap-1.5 cursor-not-allowed">
                        {tool.cta}
                      </span>
                    ) : (
                      <Link
                        href={tool.href}
                        className="w-full py-3 text-white rounded-xl text-[13px] font-bold inline-flex items-center justify-center gap-1.5 shadow-sm transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
                        style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}
                      >
                        {tool.cta}
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* FAQs section on tools page */}
          <section className="mt-28 max-w-3xl mx-auto border-t border-slate-200/60 pt-20 pb-12">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Frequently Asked Questions</h2>
              <p className="text-slate-400 text-sm mt-2">Everything you need to know about our free sales tools.</p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left font-bold text-slate-800 flex items-center justify-between hover:text-brand-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight size={18} className={`text-slate-400 transition-transform ${activeFaq === index ? 'rotate-90 text-brand-500' : ''}`} />
                  </button>
                  {activeFaq === index && (
                    <div className="px-6 pb-5 pt-1 text-slate-500 text-sm leading-relaxed border-t border-slate-100 font-normal">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <SiteFooter />
      </div>
    </>
  )
}
