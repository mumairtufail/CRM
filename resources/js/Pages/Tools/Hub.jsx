import { Head, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Mail, FileText, ArrowRight, Award, HelpCircle, ChevronRight, Zap } from 'lucide-react'
import Logo, { LogoMark } from '@/Components/Common/Logo'

export default function Hub({ latestBlogs = [] }) {
  const [activeFaq, setActiveFaq] = useState(null)

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
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#F8F9FD]/80 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Logo size={32} showText={true} text="LumeniaCRM" textClassName="text-[17px] font-extrabold" />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-[14px] font-semibold text-slate-600">
              <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
              <Link href="/blog" className="hover:text-violet-600 transition-colors">Blog</Link>
              <Link href="/tools" className="text-violet-600">Free Tools</Link>
              <Link href="/login" className="hover:text-violet-600 transition-colors">Sign in</Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[13px] font-bold shadow-sm shadow-violet-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </header>

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
                    className="w-full px-6 py-4.5 text-left font-bold text-slate-800 flex items-center justify-between hover:text-violet-600 transition-colors"
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
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-white/5 pb-10">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <LogoMark size={28} />
                  <span className="font-extrabold text-white text-[15px]">Lumenia CRM</span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  A premium CRM for scaling sales teams. Manage pipelines, invoices, email campaigns, and support.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Product</h4>
                <ul className="space-y-2 text-xs">
                  <li><Link href="/#features" className="text-slate-500 hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="/#pricing" className="text-slate-500 hover:text-white transition-colors">Pricing</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Free Tools</h4>
                <ul className="space-y-2 text-xs">
                  <li><Link href="/tools/email-signature-generator" className="text-slate-500 hover:text-white transition-colors">Email Signature Generator</Link></li>
                  <li><Link href="/tools/invoice-generator" className="text-slate-500 hover:text-white transition-colors">Invoice Generator</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Latest Blogs</h4>
                <ul className="space-y-2 text-xs">
                  <li><Link href="/blog" className="text-violet-400 hover:text-white font-semibold transition-colors">Our Blog</Link></li>
                  {latestBlogs.slice(0, 2).map((b) => (
                    <li key={b.slug}>
                      <Link href={`/blog/${b.slug}`} className="text-slate-500 hover:text-white transition-colors block truncate max-w-[200px]">
                        {b.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
              <p>© {new Date().getFullYear()} Lumenia Lab. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="mailto:hello@lumenialab.com" className="hover:text-white transition-colors">hello@lumenialab.com</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
