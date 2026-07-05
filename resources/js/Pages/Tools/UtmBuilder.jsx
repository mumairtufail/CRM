import { Head, Link } from '@inertiajs/react'
import { useState } from 'react'
import { ArrowLeft, Check, Copy, RefreshCw, Sparkles, Menu, X, ChevronRight, Link2, Share2, HelpCircle } from 'lucide-react'
import Logo, { LogoMark } from '@/Components/Common/Logo'
import SiteFooter from '@/Components/Common/SiteFooter'

export default function UtmBuilder({ latestBlogs = [] }) {
  const [copied, setCopied] = useState(false)
  const [activeFaq, setActiveFaq] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: 'How it works', href: '/#flow'    },
    { label: 'Features',     href: '/#modules' },
    { label: 'Pricing',      href: '/#pricing' },
    { label: 'Contact',      href: '/#contact' },
  ]

  // UTM builder state
  const [formData, setFormData] = useState({
    websiteUrl: 'https://mywebsite.com',
    source: 'google',
    medium: 'cpc',
    name: 'summer_sale',
    term: '',
    content: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Pre-configured B2B standard options
  const defaultSources = ['google', 'facebook', 'linkedin', 'newsletter', 'twitter', 'partner']
  const defaultMediums = ['cpc', 'social', 'email', 'banner', 'referral', 'organic_social']

  const buildUtmUrl = () => {
    const { websiteUrl, source, medium, name, term, content } = formData
    if (!websiteUrl) return ''

    let cleanUrl = websiteUrl.trim()
    
    // Auto add http if missing
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl
    }

    try {
      const urlObj = new URL(cleanUrl)
      
      if (source) urlObj.searchParams.set('utm_source', source.trim())
      if (medium) urlObj.searchParams.set('utm_medium', medium.trim())
      if (name) urlObj.searchParams.set('utm_campaign', name.trim())
      if (term) urlObj.searchParams.set('utm_term', term.trim())
      if (content) urlObj.searchParams.set('utm_content', content.trim())

      return urlObj.toString()
    } catch (e) {
      return 'Invalid URL format'
    }
  }

  const generatedUrl = buildUtmUrl()

  const copyToClipboard = () => {
    if (!generatedUrl || generatedUrl === 'Invalid URL format') return
    
    navigator.clipboard.writeText(generatedUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    })
  }

  const resetForm = () => {
    setFormData({
      websiteUrl: 'https://mywebsite.com',
      source: '',
      medium: '',
      name: '',
      term: '',
      content: ''
    })
  }

  const faqs = [
    {
      q: "What is a UTM link?",
      a: "A UTM link is a standard URL that has specific tracking parameters appended to the end. These parameters (Source, Medium, Campaign) tell analytics software (like Google Analytics or your CRM) exactly where a visitor came from when they clicked the link."
    },
    {
      q: "Why should I use UTM parameters?",
      a: "Without UTM parameters, all referral visits from social media or email look generic. Appending UTM parameters lets you differentiate clicks from a paid LinkedIn banner vs. an organic post, or a specific newsletter email vs. a transaction confirmation message."
    },
    {
      q: "Are the UTM parameters case sensitive?",
      a: "Yes! Google Analytics and other tools treat uppercase and lowercase campaigns as separate entries (e.g., 'facebook' vs 'Facebook'). To maintain clean reports, always use lowercase letters for your UTM values."
    }
  ]

  return (
    <>
      <Head>
        <title>Free Marketing UTM Campaign URL Builder · Lumenia CRM</title>
        <meta name="description" content="Generate trackable UTM campaign URLs for Google Analytics, CRMs, and marketing. Instantly add utm_source, utm_medium, and campaign tags for free." />
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

        {/* Page header */}
        <div className="max-w-3xl mx-auto px-6 pt-12 pb-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Free UTM Link Builder
          </h1>
          <p className="text-slate-500 leading-relaxed">
            Build a trackable campaign link in seconds, so you know exactly which channel brought a lead in.
          </p>
        </div>

        {/* Builder Area */}
        <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: UTM configuration inputs */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Campaign UTM Builder</h2>
              <p className="text-xs text-slate-400 font-normal mt-1">Configure your target link and campaign details below.</p>
            </div>

            <div className="space-y-4">
              {/* Website URL */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Website Landing Page URL *</label>
                <input
                  type="text"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-500"
                  placeholder="https://mywebsite.com"
                />
              </div>

              {/* Source */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Campaign Source (utm_source) *</label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-500 mb-2"
                  placeholder="e.g. google, facebook, newsletter"
                />
                <div className="flex flex-wrap gap-1.5">
                  {defaultSources.map(src => (
                    <button
                      key={src}
                      onClick={() => setFormData(prev => ({ ...prev, source: src }))}
                      className="px-2.5 py-1 border border-slate-100 hover:border-slate-300 text-slate-500 hover:text-slate-700 bg-slate-50 rounded-lg text-[10px] font-bold"
                    >
                      {src}
                    </button>
                  ))}
                </div>
              </div>

              {/* Medium */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Campaign Medium (utm_medium) *</label>
                <input
                  type="text"
                  name="medium"
                  value={formData.medium}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-500 mb-2"
                  placeholder="e.g. cpc, social, email, banner"
                />
                <div className="flex flex-wrap gap-1.5">
                  {defaultMediums.map(med => (
                    <button
                      key={med}
                      onClick={() => setFormData(prev => ({ ...prev, medium: med }))}
                      className="px-2.5 py-1 border border-slate-100 hover:border-slate-300 text-slate-500 hover:text-slate-700 bg-slate-50 rounded-lg text-[10px] font-bold"
                    >
                      {med}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campaign Name */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Campaign Name (utm_campaign) *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-500"
                  placeholder="e.g. summer_sale, launch_2026"
                />
              </div>

              {/* Advanced fields */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Campaign Term (utm_term)</label>
                  <input
                    type="text"
                    name="term"
                    value={formData.term}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-500"
                    placeholder="e.g. key_words"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Campaign Content (utm_content)</label>
                  <input
                    type="text"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-500"
                    placeholder="e.g. blue_banner"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Real-time Output & Conversion */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Generated Link Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between min-h-[300px]">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Link2 size={18} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">Your Tracked Campaign URL</h3>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-xs font-mono text-slate-600 break-all select-all select-none">
                    {generatedUrl || 'Enter your Website URL on the left...'}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-xs font-bold transition-all"
                >
                  Reset Form
                </button>
                <button
                  onClick={copyToClipboard}
                  disabled={!generatedUrl || generatedUrl === 'Invalid URL format'}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                  {copied ? 'Copied Campaign Link!' : 'Copy Campaign Link'}
                </button>
              </div>
            </div>

            {/* Upsell Banner */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-extrabold text-base">Want to trace lead sources automatically?</h3>
                <p className="text-xs text-violet-100/90 leading-relaxed max-w-md mt-1 font-normal">
                  In Lumenia CRM, when leads click your UTM campaign links and sign up, their profile is automatically tagged with the campaign source, giving you full ROI tracking.
                </p>
              </div>
              <Link
                href="/register"
                className="px-5 py-3 bg-white hover:bg-slate-50 text-violet-700 rounded-xl text-xs font-extrabold shadow-sm whitespace-nowrap transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Lumenia CRM Free
              </Link>
            </div>

          </div>
        </main>

        {/* FAQ Area */}
        <section className="bg-white border-t border-slate-200 mt-20 py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="prose prose-slate max-w-none mb-16">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-6 font-sans">
                Streamline Your B2B Marketing Analytics
              </h2>
              <p className="text-slate-500 leading-relaxed font-normal mb-4">
                Tracking your outbound links is the key to understanding your advertising spend and campaign effectiveness. If you post links on LinkedIn, run Google PPC ads, or send newsletter lists without tracking codes, you won't be able to calculate your cost per lead or conversion metrics.
              </p>
              <p className="text-slate-500 leading-relaxed font-normal mb-4">
                Our free campaign builder constructs clean, standardized campaign URLs, supporting dynamic tags (utm_source, utm_medium, utm_campaign) that align perfectly with Google Analytics GA4.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-16">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight text-center mb-10">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-slate-200/60 rounded-xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                      className="w-full px-6 py-4 text-left font-bold text-slate-800 flex items-center justify-between hover:text-violet-600 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronRight size={18} className={`text-slate-400 transition-transform ${activeFaq === index ? 'rotate-90 text-violet-500' : ''}`} />
                    </button>
                    {activeFaq === index && (
                      <div className="px-6 pb-5 pt-2 text-slate-500 text-sm leading-relaxed border-t border-slate-100 font-normal">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <SiteFooter />
      </div>
    </>
  )
}
