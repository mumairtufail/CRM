import { Head, Link } from '@inertiajs/react'
import { useState, useRef } from 'react'
import { ArrowLeft, Check, Copy, Plus, Trash2, Printer, Sparkles, Menu, X, ChevronRight, FileText, PenTool } from 'lucide-react'
import Logo, { LogoMark } from '@/Components/Common/Logo'
import SiteFooter from '@/Components/Common/SiteFooter'
import SeoHead from '@/Components/Common/SeoHead'

export default function ProposalWriter({ latestBlogs = [] }) {
  const previewRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('info') // info, content, terms
  const [activeFaq, setActiveFaq] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: 'How it works', href: '/#flow'    },
    { label: 'Features',     href: '/#modules' },
    { label: 'Pricing',      href: '/#pricing' },
    { label: 'Contact',      href: '/#contact' },
  ]

  // Proposal writer state
  const [formData, setFormData] = useState({
    title: 'Strategic Marketing Campaign Proposal',
    company: 'Apex Digital Solutions',
    companyAddress: '123 Business Rd, New York, NY 10001',
    client: 'Skyline Enterprises LLC',
    clientContact: 'John Doe, VP of Marketing',
    clientAddress: '456 Tech Blvd, San Francisco, CA 94107',
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: '$',
    
    // Content sections
    intro: 'This proposal details the strategic digital marketing and outbound sales campaigns designed to accelerate Skyline Enterprises growth. Our focus is to deliver high-quality, verified pipeline leads and build a repeatable outreach system.',
    
    services: [
      { id: 1, name: 'B2B Lead List Generation', desc: 'Sourcing 500 verified founder and executive profiles matching Skyline\'s ICP.', cost: 1500 },
      { id: 2, name: 'Cold Email Sequence Design', desc: 'Writing high-converting, 3-step automated campaign sequences.', cost: 1000 },
      { id: 3, name: 'Inbox Deliverability Optimization', desc: 'Setting up custom tracking domains and warming up sending addresses.', cost: 800 }
    ],
    
    terms: '1. Standard 50% deposit required to initiate the project campaign.\n2. Balance due within 14 days of deliverables approval.\n3. All feedback loops and copy revisions will be completed within 5 business days.'
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleServiceChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(s => {
        if (s.id === id) {
          const parsedVal = field === 'cost' ? Number(value) || 0 : value
          return { ...s, [field]: parsedVal }
        }
        return s
      })
    }))
  }

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [
        ...prev.services,
        { id: Date.now(), name: 'New Service Line', desc: 'Brief description of service scope.', cost: 0 }
      ]
    }))
  }

  const removeService = (id) => {
    if (formData.services.length <= 1) return
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== id)
    }))
  }

  const totalCost = formData.services.reduce((sum, s) => sum + s.cost, 0)

  // Copy rich text proposal to clipboard
  const copyRichText = () => {
    if (!previewRef.current) return
    
    const range = document.createRange()
    range.selectNode(previewRef.current)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)

    try {
      document.execCommand('copy')
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      console.error('Failed to copy proposal text', err)
    }
    selection.removeAllRanges()
  }

  const handlePrint = () => {
    window.print()
  }

  const faqs = [
    {
      q: "What should be included in a professional B2B proposal?",
      a: "A B2B proposal should contain clearly structured information: introduction/executive summary, breakdown of services or SOW (Scope of Work), client details, project pricing, payment terms, expiration/validity date, and dedicated signature lines for both parties."
    },
    {
      q: "How do I save my generated proposal as a PDF?",
      a: "Simply click 'Print Proposal / Save PDF' to open the system print dialog. Change your printing destination to 'Save as PDF', select your desired page margins, and click Save."
    },
    {
      q: "Can I manage contracts and proposals inside Lumenia CRM?",
      a: "Yes! Lumenia CRM allows you to create custom proposals and contracts directly from client profiles. When the client signs the contract, the deal automatically updates to 'Won', and a corresponding invoicing schedule is generated instantly."
    }
  ]

  return (
    <>
      <SeoHead
        title="Free Online B2B Proposal & Contract Writer · Lumenia CRM"
        description="Draft and generate professional B2B project proposals and freelance contracts. Customize templates, outline service deliverables, add pricing, and print as PDF for free."
        path="/tools/proposal-writer"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
          })),
        }}
      />
      <Head>
        <style>{`
          @media print {
            body, html {
              background: white !important;
              color: black !important;
              font-size: 13px !important;
            }
            @page {
              size: portrait;
              margin: 10mm 12mm !important;
            }
            main {
              padding: 0 !important;
              margin: 0 !important;
            }
            .print-proposal-card {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
            }
          }
        `}</style>
      </Head>

      <div className="min-h-screen bg-[rgb(var(--brand-tint))] font-sans antialiased text-slate-800 flex flex-col justify-between print:bg-white print:p-0">
        
        {/* Header/Nav - hide on print */}
        <nav className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 transition-all duration-300 print:hidden">
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
        <div className="h-16 w-full shrink-0 print:hidden" />

        {/* Page header */}
        <div className="max-w-3xl mx-auto px-6 pt-12 pb-4 text-center print:hidden">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Free Proposal Writer
          </h1>
          <p className="text-slate-500 leading-relaxed">
            Draft a client proposal or contract with deliverables and pricing, ready to print or send as a PDF.
          </p>
        </div>

        {/* Builder Area */}
        <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:py-0 print:px-0">
          
          {/* Left panel: Editor Controls */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              {[
                { id: 'info', label: 'Client Details' },
                { id: 'content', label: 'Deliverables' },
                { id: 'terms', label: 'Payment Terms' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 text-xs font-bold border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand-600 text-brand-600 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="p-6 space-y-5">
              
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Proposal Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Valid Until</label>
                      <input
                        type="date"
                        name="validUntil"
                        value={formData.validUntil}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <h4 className="text-xs font-bold text-slate-700">Service Provider (You)</h4>
                    <div>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none mb-2"
                        placeholder="Your Company"
                      />
                      <textarea
                        name="companyAddress"
                        value={formData.companyAddress}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none resize-none"
                        placeholder="Company Address"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <h4 className="text-xs font-bold text-slate-700">Client Info</h4>
                    <div>
                      <input
                        type="text"
                        name="client"
                        value={formData.client}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none mb-2"
                        placeholder="Client Company Name"
                      />
                      <input
                        type="text"
                        name="clientContact"
                        value={formData.clientContact}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none mb-2"
                        placeholder="Contact Person (e.g., Jane Doe, VP)"
                      />
                      <textarea
                        name="clientAddress"
                        value={formData.clientAddress}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none resize-none"
                        placeholder="Client Address"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Executive Summary / Intro</label>
                    <textarea
                      name="intro"
                      value={formData.intro}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none resize-none"
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-700 font-sans">Scope & Deliverables</h4>
                      <button
                        onClick={addService}
                        className="text-brand-600 hover:text-brand-700 text-xs font-bold flex items-center gap-1"
                      >
                        <Plus size={14} /> Add Line
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                      {formData.services.map((service) => (
                        <div key={service.id} className="p-3 border border-slate-100 bg-slate-50 rounded-lg space-y-2 relative group">
                          <button
                            onClick={() => removeService(service.id)}
                            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 size={14} />
                          </button>
                          
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) => handleServiceChange(service.id, 'name', e.target.value)}
                            className="w-[85%] bg-transparent border-b border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-none text-xs font-bold text-slate-800"
                            placeholder="Service Name"
                          />
                          
                          <textarea
                            value={service.desc}
                            onChange={(e) => handleServiceChange(service.id, 'desc', e.target.value)}
                            rows={2}
                            className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-none text-xs text-slate-500 resize-none"
                            placeholder="Description"
                          />
                          
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-400 font-bold">Cost ({formData.currency}):</span>
                            <input
                              type="number"
                              value={service.cost}
                              onChange={(e) => handleServiceChange(service.id, 'cost', e.target.value)}
                              className="w-20 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-none text-xs font-bold text-slate-700"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'terms' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Terms and Conditions</label>
                    <textarea
                      name="terms"
                      value={formData.terms}
                      onChange={handleInputChange}
                      rows={8}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right panel: Proposal Document Preview */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Preview Paper */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 md:p-12 print-proposal-card print:border-0 print:shadow-none print:p-0">
              
              <div ref={previewRef} className="space-y-8 font-serif text-slate-900 leading-relaxed text-sm">
                
                {/* Proposal Title Header */}
                <div className="border-b-2 border-slate-900 pb-6 flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <h2 className="text-2xl font-black font-sans tracking-tight text-slate-900 leading-tight mb-2 uppercase">{formData.title}</h2>
                    <p className="text-xs text-slate-500 font-sans font-medium">B2B Commercial Offer</p>
                  </div>
                  <div className="text-right text-xs text-slate-500 font-sans space-y-1 md:ml-auto">
                    <div><strong>Date:</strong> {formData.date}</div>
                    <div><strong>Valid Until:</strong> {formData.validUntil}</div>
                  </div>
                </div>

                {/* Sender / Receiver Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-sans text-slate-600">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Prepared By:</span>
                    <strong className="text-slate-800 text-sm block">{formData.company}</strong>
                    <p className="whitespace-pre-line leading-relaxed">{formData.companyAddress}</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Prepared For:</span>
                    <strong className="text-slate-800 text-sm block">{formData.client}</strong>
                    <div className="font-semibold text-slate-700">{formData.clientContact}</div>
                    <p className="whitespace-pre-line leading-relaxed">{formData.clientAddress}</p>
                  </div>
                </div>

                {/* Intro Text */}
                <div className="space-y-2">
                  <h3 className="text-base font-extrabold font-sans text-slate-800 tracking-tight border-b border-slate-100 pb-1 mb-2 uppercase">1. Executive Summary</h3>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{formData.intro}</p>
                </div>

                {/* Scope & Cost list */}
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold font-sans text-slate-800 tracking-tight border-b border-slate-100 pb-1 uppercase">2. Scope of Services & Deliverables</h3>
                  <div className="space-y-4 divide-y divide-slate-100">
                    {formData.services.map((service, index) => (
                      <div key={service.id} className={`${index > 0 ? 'pt-4' : ''} flex justify-between gap-6`}>
                        <div className="space-y-1">
                          <strong className="text-sm font-sans font-extrabold text-slate-800">{service.name}</strong>
                          <p className="text-xs text-slate-500 leading-relaxed font-sans">{service.desc}</p>
                        </div>
                        <div className="text-right whitespace-nowrap font-sans font-bold text-slate-700">
                          {formData.currency}{service.cost.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t-2 border-slate-900 pt-4 flex justify-between items-center text-sm font-black font-sans text-slate-900">
                    <span>Total Proposed Budget:</span>
                    <span className="text-lg text-brand-700">{formData.currency}{totalCost.toLocaleString()}</span>
                  </div>
                </div>

                {/* Agreement Terms */}
                <div className="space-y-2">
                  <h3 className="text-base font-extrabold font-sans text-slate-800 tracking-tight border-b border-slate-100 pb-1 mb-2 uppercase">3. Agreement Terms</h3>
                  <p className="text-slate-600 text-xs font-sans whitespace-pre-line leading-relaxed">{formData.terms}</p>
                </div>

                {/* Signature box */}
                <div className="pt-10 grid grid-cols-2 gap-10 text-xs font-sans text-slate-500">
                  <div className="border-t border-slate-300 pt-3 space-y-1.5">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Accepted By ({formData.client}):</span>
                    <div className="h-10"></div>
                    <div className="border-b border-dashed border-slate-200 w-3/4"></div>
                    <div>Signature / Date</div>
                  </div>
                  <div className="border-t border-slate-300 pt-3 space-y-1.5">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Authorized Representative:</span>
                    <div className="h-10"></div>
                    <div className="border-b border-dashed border-slate-200 w-3/4"></div>
                    <div>Signature / Date</div>
                  </div>
                </div>

              </div>

              {/* Action Bar - hide on print */}
              <div className="mt-12 pt-6 border-t border-slate-100 flex flex-wrap gap-4 justify-end print:hidden">
                <button
                  onClick={copyRichText}
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copied ? 'Copied Proposal!' : 'Copy Proposal Text'}
                </button>
                <button
                  onClick={handlePrint}
                  className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all"
                >
                  <Printer size={14} />
                  Print Proposal / Save PDF
                </button>
              </div>
            </div>

            {/* Upsell Box - hide on print */}
            <div className="bg-gradient-to-r from-brand-600 to-brand2-600 p-6 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
              <div>
                <h3 className="font-extrabold text-base">Tired of drafting proposals manually?</h3>
                <p className="text-xs text-brand-100/90 leading-relaxed max-w-md mt-1 font-normal">
                  Create and send commercial proposals directly from CRM deals. Allow clients to e-sign agreements securely and auto-convert deals to project task lists instantly.
                </p>
              </div>
              <Link
                href="/register"
                className="px-5 py-3 bg-white hover:bg-slate-50 text-brand-700 rounded-xl text-xs font-extrabold shadow-sm whitespace-nowrap transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Free Account
              </Link>
            </div>

          </div>
        </main>

        {/* SEO copy & FAQ sections */}
        <section className="bg-white border-t border-slate-200 mt-20 py-20 print:hidden">
          <div className="max-w-4xl mx-auto px-6">
            <div className="prose prose-slate max-w-none mb-16">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-6">
                Why a Well-Crafted Business Proposal Wins More Deals
              </h2>
              <p className="text-slate-500 leading-relaxed font-normal mb-4">
                A professional proposal is more than just a pricing sheet. It aligns expectations, defines project boundaries, and offers the client confidence in your business workflow. High-performing sales teams use proposals to clearly outline client challenges, introduce targeted deliverables, and clarify payment timelines.
              </p>
              <p className="text-slate-500 leading-relaxed font-normal mb-4">
                This free writer helps freelancers, independent consultants, and sales agencies quickly structure their commercial offers, formatting clean, print-friendly outputs that can be e-signed on the spot or saved as PDFs.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-16">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight text-center mb-10">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-slate-200/60 rounded-xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                      className="w-full px-6 py-4 text-left font-bold text-slate-800 flex items-center justify-between hover:text-brand-600 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronRight size={18} className={`text-slate-400 transition-transform ${activeFaq === index ? 'rotate-90 text-brand-500' : ''}`} />
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
        <SiteFooter className="print:hidden" />
      </div>
    </>
  )
}
