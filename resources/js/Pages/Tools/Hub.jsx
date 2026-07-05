import { Head, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Mail, FileText, ArrowRight, Award, HelpCircle, ChevronRight, Zap, Menu, X, PenTool, Link2 } from 'lucide-react'
import Logo, { LogoMark } from '@/Components/Common/Logo'

export default function Hub({ latestBlogs = [] }) {
  const [activeFaq, setActiveFaq] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: 'Features',       href: '/#features'      },
    { label: 'AI Prospecting', href: '/#integrations'  },
    { label: 'How it works',   href: '/#how-it-works'  },
    { label: 'Pricing',        href: '/#pricing'       },
    { label: 'Contact',        href: '/#contact'       },
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
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-100',
      cta: 'Create Free Invoice',
    },
    {
      id: 'proposal-writer',
      title: 'B2B Proposal & Contract Writer',
      description: 'Draft premium client proposals, commercial offers, and freelance contracts in your browser. Outline project deliverables, pricing, and download print-ready PDFs.',
      icon: PenTool,
      href: '/tools/proposal-writer',
      badge: 'Bestseller',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-100',
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

      <div className="min-h-screen bg-[#F8F9FD] font-sans antialiased text-slate-800 flex flex-col justify-between">
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
                               className="text-sm font-medium text-slate-600 transition-colors hover:text-violet-500">{label}</a>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        <Link href="/login"
                              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                            Sign In
                        </Link>
                        <Link href="/register"
                              className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
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
                              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </nav>

        {/* Spacer for sticky header */}
        <div className="h-16 w-full shrink-0" />

        {/* Hero */}
        <section className="py-20 md:py-28 text-center bg-gradient-to-b from-white to-transparent relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full opacity-[0.03] pointer-events-none blur-3xl bg-violet-600" />
          <div className="max-w-4xl mx-auto px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100/50 mb-6">
              <Zap size={12} className="text-violet-600 fill-violet-600" />
              <span className="text-violet-700 text-[10px] font-extrabold uppercase tracking-wider">Free Business Resources</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              Free Sales & Growth <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Power Tools</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
              Accelerate your sales workflow, create professional brand assets, and optimize your organic outreach with zero cost.
            </p>
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
                      <div className={`p-3.5 rounded-xl ${tool.disabled ? 'bg-slate-50 text-slate-400' : 'bg-violet-50 text-violet-600'}`}>
                        <Icon size={24} />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-violet-600 transition-colors">
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
                        className="w-full py-3 bg-slate-900 hover:bg-violet-600 text-white rounded-xl text-[13px] font-bold inline-flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
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
                    className="w-full px-6 py-4 text-left font-bold text-slate-800 flex items-center justify-between hover:text-violet-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight size={18} className={`text-slate-400 transition-transform ${activeFaq === index ? 'rotate-90 text-violet-500' : ''}`} />
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
        <footer style={{ background: '#030208' }} className="border-t border-white/5 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2.5 mb-4">
                            <LogoMark size={32} />
                            <span className="font-extrabold text-white text-[17px] tracking-tight leading-none">Lumenia CRM</span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            A CRM for sales teams that actually want to use their CRM. By Lumenia Lab.
                        </p>
                    </div>

                    {[
                        { heading: 'Product', links: [{ label: 'Features', href: '/#features' }, { label: 'Pricing', href: '/#pricing' }, { label: 'FAQ', href: '/#faq' }, { label: 'Changelog', href: '#' }] },
                        { heading: 'Free Tools', links: [{ label: 'Email Signature', href: '/tools/email-signature-generator', internal: true }, { label: 'Invoice Generator', href: '/tools/invoice-generator', internal: true }, { label: 'Proposal Writer', href: '/tools/proposal-writer', internal: true }, { label: 'UTM Builder', href: '/tools/utm-builder', internal: true }, { label: 'All Free Tools', href: '/tools', internal: true }] },
                        { heading: 'Account', links: [{ label: 'Sign In', href: '/login', internal: true }, { label: 'Register', href: '/register', internal: true }, { label: 'Support', href: '#' }, { label: 'Contact', href: '#' }] },
                        { heading: 'Legal',   links: [{ label: 'Privacy Policy', href: '#' }, { label: 'Terms of Service', href: '#' }, { label: 'Security', href: '#' }] },
                    ].map(({ heading, links }) => (
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
                        © {new Date().getFullYear()} Lumenia Lab. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-slate-700 hover:text-white text-sm transition-colors">Twitter / X</a>
                        <a href="#" className="text-slate-700 hover:text-white text-sm transition-colors">LinkedIn</a>
                        <a href="mailto:hello@lumenialab.com"
                           className="text-slate-700 hover:text-white text-sm transition-colors">
                            hello@lumenialab.com
                        </a>
                    </div>
                </div>
            </div>
        </footer>
      </div>
    </>
  )
}
