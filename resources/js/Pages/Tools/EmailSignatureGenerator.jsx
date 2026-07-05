import { Head, Link } from '@inertiajs/react'
import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Check, Copy, RefreshCw, Sparkles, Layout, Palette, Share2, HelpCircle, ChevronRight, Menu, X } from 'lucide-react'
import Logo, { LogoMark } from '@/Components/Common/Logo'
import SiteFooter from '@/Components/Common/SiteFooter'

export default function EmailSignatureGenerator({ latestBlogs = [] }) {
  const previewRef = useRef(null)
  const [copiedRich, setCopiedRich] = useState(false)
  const [copiedHtml, setCopiedHtml] = useState(false)
  const [activeTab, setActiveTab] = useState('general') // general, company, social, design
  const [activeFaq, setActiveFaq] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: 'How it works', href: '/#flow'    },
    { label: 'Features',     href: '/#modules' },
    { label: 'Pricing',      href: '/#pricing' },
    { label: 'Contact',      href: '/#contact' },
  ]
  
  // Signature data state
  const [formData, setFormData] = useState({
    firstName: 'Sarah',
    lastName: 'Conner',
    jobTitle: 'Head of Growth',
    department: 'Sales & Marketing',
    company: 'Apex Digital',
    phone: '+92 300 1234567',
    mobile: '',
    email: 'sarah@apexdigital.com',
    website: 'https://apexdigital.com',
    address: 'Lahore, Pakistan',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    logo: '',
    // Social
    linkedin: 'https://linkedin.com/in/sarah-conner',
    twitter: 'https://twitter.com/sarah_growth',
    facebook: '',
    instagram: '',
    // Design
    themeColor: 'rgb(var(--brand-600))',
    textColor: '#1E293B',
    accentColor: '#64748B',
    fontFamily: 'Arial, sans-serif',
    layout: 'classic', // classic, minimal, stack
    includeBranding: true,
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Pre-configured color swatches
  const colorSwatches = [
    'rgb(var(--brand-600))', // Violet
    'rgb(var(--brand2-600))', // Indigo
    '#0EA5E9', // Sky Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#1E293B', // Dark Slate
  ]

  // Render HTML code string
  const getSignatureHtml = () => {
    const {
      firstName, lastName, jobTitle, department, company,
      phone, mobile, email, website, address, avatar, logo,
      linkedin, twitter, facebook, instagram,
      themeColor, textColor, accentColor, fontFamily, layout, includeBranding
    } = formData

    const name = `${firstName} ${lastName}`.trim() || 'Your Name'
    const titleAndDept = [jobTitle, department].filter(Boolean).join(' - ') || 'Your Job Title'

    const avatarHtml = avatar ? `
      <td style="padding-right: 20px; vertical-align: top;">
        <img src="${avatar}" alt="${name}" width="80" height="80" style="border-radius: 50%; object-fit: cover; display: block; max-width: 80px; max-height: 80px;" />
      </td>
    ` : ''

    const socialLinks = []
    if (linkedin) socialLinks.push(`<a href="${linkedin}" style="color: ${themeColor}; text-decoration: none; font-size: 13px; font-weight: bold; margin-right: 8px;">LinkedIn</a>`)
    if (twitter) socialLinks.push(`<a href="${twitter}" style="color: ${themeColor}; text-decoration: none; font-size: 13px; font-weight: bold; margin-right: 8px;">Twitter</a>`)
    if (facebook) socialLinks.push(`<a href="${facebook}" style="color: ${themeColor}; text-decoration: none; font-size: 13px; font-weight: bold; margin-right: 8px;">Facebook</a>`)
    if (instagram) socialLinks.push(`<a href="${instagram}" style="color: ${themeColor}; text-decoration: none; font-size: 13px; font-weight: bold; margin-right: 8px;">Instagram</a>`)
    const socialsHtml = socialLinks.length > 0 ? `
      <tr style="margin-top: 10px;">
        <td style="padding-top: 8px;">
          ${socialLinks.join(' <span style="color: #cbd5e1; margin-right: 8px;">|</span> ')}
        </td>
      </tr>
    ` : ''

    const brandingHtml = includeBranding ? `
      <tr>
        <td style="padding-top: 12px; font-size: 10px; color: #94a3b8; font-family: ${fontFamily}; line-height: 1.2;">
          Created with <a href="${window.location.origin}" style="color: ${themeColor}; text-decoration: none; font-weight: bold;">Lumenia CRM</a>
        </td>
      </tr>
    ` : ''

    if (layout === 'classic') {
      return `
        <table cellpadding="0" cellspacing="0" style="font-family: ${fontFamily}; color: ${textColor}; line-height: 1.5; font-size: 14px; text-align: left;">
          <tr>
            <td style="vertical-align: top;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  ${avatarHtml}
                  <td style="vertical-align: top; border-left: 2px solid ${themeColor}; padding-left: 20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 17px; font-weight: bold; color: ${textColor}; font-family: ${fontFamily}; line-height: 1.2;">${name}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: ${accentColor}; font-family: ${fontFamily}; padding-bottom: 8px;">${titleAndDept} at <strong>${company || 'Company'}</strong></td>
                      </tr>
                      ${email ? `<tr><td style="font-size: 13px; font-family: ${fontFamily}; color: ${textColor};">Email: <a href="mailto:${email}" style="color: ${themeColor}; text-decoration: none;">${email}</a></td></tr>` : ''}
                      ${phone ? `<tr><td style="font-size: 13px; font-family: ${fontFamily}; color: ${textColor};">Phone: <span style="color: ${textColor};">${phone}</span></td></tr>` : ''}
                      ${website ? `<tr><td style="font-size: 13px; font-family: ${fontFamily}; color: ${textColor};">Web: <a href="${website}" style="color: ${themeColor}; text-decoration: none;">${website.replace(/^https?:\/\//, '')}</a></td></tr>` : ''}
                      ${address ? `<tr><td style="font-size: 12px; font-family: ${fontFamily}; color: ${accentColor};">${address}</td></tr>` : ''}
                      ${socialsHtml}
                    </table>
                  </td>
                </tr>
                ${brandingHtml}
              </table>
            </td>
          </tr>
        </table>
      `.trim()
    }

    if (layout === 'stack') {
      return `
        <table cellpadding="0" cellspacing="0" style="font-family: ${fontFamily}; color: ${textColor}; line-height: 1.5; font-size: 14px; text-align: left;">
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0">
                ${avatar ? `<tr><td style="padding-bottom: 12px;"><img src="${avatar}" alt="${name}" width="64" height="64" style="border-radius: 8px; object-fit: cover; display: block;" /></td></tr>` : ''}
                <tr>
                  <td style="font-size: 16px; font-weight: bold; color: ${textColor};">${name}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: ${accentColor}; font-weight: 500; padding-bottom: 6px;">${titleAndDept} | ${company || 'Company'}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: ${textColor}; border-top: 1px solid #e2e8f0; padding-top: 6px;">
                    ${email ? `<a href="mailto:${email}" style="color: ${themeColor}; text-decoration: none; margin-right: 12px;">${email}</a>` : ''}
                    ${phone ? `<span style="color: ${textColor};">${phone}</span>` : ''}
                  </td>
                </tr>
                ${website ? `<tr><td style="font-size: 13px;"><a href="${website}" style="color: ${themeColor}; text-decoration: none;">${website.replace(/^https?:\/\//, '')}</a></td></tr>` : ''}
                ${socialsHtml}
                ${brandingHtml}
              </table>
            </td>
          </tr>
        </table>
      `.trim()
    }

    // Minimal
    return `
      <table cellpadding="0" cellspacing="0" style="font-family: ${fontFamily}; color: ${textColor}; line-height: 1.4; font-size: 13.5px; text-align: left;">
        <tr>
          <td>
            <strong style="color: ${themeColor}; font-size: 15px;">${name}</strong>
            <span style="color: #cbd5e1; margin: 0 6px;">|</span>
            <span style="color: ${accentColor};">${titleAndDept} at ${company || 'Company'}</span>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 4px;">
            ${email ? `<a href="mailto:${email}" style="color: ${textColor}; text-decoration: none; font-weight: 600;">${email}</a>` : ''}
            ${phone ? `<span style="color: #cbd5e1; margin: 0 6px;">•</span><span style="color: ${textColor};">${phone}</span>` : ''}
            ${website ? `<span style="color: #cbd5e1; margin: 0 6px;">•</span><a href="${website}" style="color: ${themeColor}; text-decoration: none; font-weight: 600;">${website.replace(/^https?:\/\//, '')}</a>` : ''}
          </td>
        </tr>
        ${socialsHtml}
        ${brandingHtml}
      </table>
    `.trim()
  }

  // Copy HTML signature code
  const copySignatureHtml = () => {
    const htmlCode = getSignatureHtml()
    navigator.clipboard.writeText(htmlCode).then(() => {
      setCopiedHtml(true)
      setTimeout(() => setCopiedHtml(false), 3000)
    })
  }

  // Copy rich text
  const copyRichText = () => {
    if (!previewRef.current) return
    
    // Select the content
    const range = document.createRange()
    range.selectNode(previewRef.current)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)

    try {
      document.execCommand('copy')
      setCopiedRich(true)
      setTimeout(() => setCopiedRich(false), 3000)
    } catch (err) {
      console.error('Failed to copy rich text', err)
    }
    selection.removeAllRanges()
  }

  const faqs = [
    {
      q: "How do I add the generated signature to Gmail?",
      a: "1. Click 'Copy Signature' to copy the rich text version.\n2. Open Gmail and click the gear icon (Settings) > 'See all settings'.\n3. Scroll down to the 'Signature' section.\n4. Click '+ Create new', name it, and paste (Ctrl+V or Cmd+V) the signature into the text box.\n5. Select your new signature under 'Signature defaults' and click 'Save Changes' at the bottom of the page."
    },
    {
      q: "How do I add the HTML signature to Outlook?",
      a: "1. Copy the HTML code by clicking 'Copy HTML Source'.\n2. In Outlook, go to File > Options > Mail > Signatures.\n3. Click 'New', name the signature, and in the Edit Signature field, paste the copied signature.\n4. Save and select it for your email accounts."
    },
    {
      q: "Why are my signature images not loading in emails?",
      a: "Your images (avatar or company logo) must be hosted on a public web server (like Unsplash, Imgur, or your website's server) so anyone receiving your email can view them. Local computer paths (e.g., C:/Users/image.png) will not work."
    },
    {
      q: "Can I use custom fonts in my email signature?",
      a: "It is highly recommended to use 'web-safe' fonts (like Arial, Georgia, Times New Roman, Verdana, Trebuchet MS) because they are installed on almost all devices. If you use a custom font, it may fall back to standard sans-serif if the recipient does not have that font installed."
    }
  ]

  return (
    <>
      <Head>
        <title>Free Email Signature Generator · Lumenia CRM</title>
        <meta name="description" content="Design and build a professional HTML email signature for Gmail, Outlook, or Apple Mail. Choose from responsive templates, customize brand colors, add social links, and logos." />
        <meta property="og:title" content="Free Email Signature Generator - Lumenia CRM" />
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

        {/* Page header */}
        <div className="max-w-3xl mx-auto px-6 pt-12 pb-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Free Email Signature Generator
          </h1>
          <p className="text-slate-500 leading-relaxed">
            Build an HTML email signature for Gmail, Outlook, or Apple Mail, with your logo, socials, and brand colors, then copy it straight in.
          </p>
        </div>

        {/* Builder Area */}
        <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Editors */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              {[
                { id: 'general', label: 'Personal' },
                { id: 'company', label: 'Company' },
                { id: 'social', label: 'Social' },
                { id: 'design', label: 'Design' },
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

            {/* Tab Contents */}
            <div className="p-6 space-y-5">
              
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                        placeholder="Sarah"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                        placeholder="Conner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                      placeholder="sarah@company.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Job Title</label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                        placeholder="Head of Growth"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Department</label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                        placeholder="Sales"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Avatar Image URL (HTTPS)</label>
                    <input
                      type="text"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                      placeholder="https://image-url.com/avatar.jpg"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 font-normal">Must be a link to a public image hosting site.</p>
                  </div>
                </div>
              )}

              {activeTab === 'company' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Company Name</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                      placeholder="Apex Digital"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                        placeholder="+92 300 1234567"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Website URL</label>
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                        placeholder="https://apexdigital.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Office Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                      placeholder="Lahore, Pakistan"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">LinkedIn Profile Link</label>
                    <input
                      type="text"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Twitter / X Link</label>
                    <input
                      type="text"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Facebook Link</label>
                    <input
                      type="text"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Instagram Link</label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'design' && (
                <div className="space-y-5">
                  {/* Layout selector */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-2">Signature Layout</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'classic', label: 'Classic Horizontal' },
                        { id: 'stack', label: 'Stacked Vertical' },
                        { id: 'minimal', label: 'Minimal Text' },
                      ].map(lay => (
                        <button
                          key={lay.id}
                          onClick={() => setFormData(p => ({ ...p, layout: lay.id }))}
                          className={`px-3 py-2 border text-[11px] font-bold rounded-lg transition-all ${
                            formData.layout === lay.id
                              ? 'border-brand-600 bg-brand-50/20 text-brand-700'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {lay.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font picker */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-2">Font Family</label>
                    <select
                      name="fontFamily"
                      value={formData.fontFamily}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 bg-white"
                    >
                      <option value="Arial, sans-serif">Arial (Recommended)</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Times New Roman, serif">Times New Roman</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                      <option value="Courier New, monospace">Courier New</option>
                    </select>
                  </div>

                  {/* Brand Color selection */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-2.5">Theme Brand Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        name="themeColor"
                        value={formData.themeColor}
                        onChange={handleInputChange}
                        className="w-8 h-8 rounded border-0 cursor-pointer overflow-hidden p-0"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {colorSwatches.map(color => (
                          <button
                            key={color}
                            onClick={() => setFormData(p => ({ ...p, themeColor: color }))}
                            className="w-5 h-5 rounded-full border border-black/5 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Branding loop check */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeBranding"
                      name="includeBranding"
                      checked={formData.includeBranding}
                      onChange={handleInputChange}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <label htmlFor="includeBranding" className="text-xs text-slate-600 font-medium">
                      Include a tiny "Powered by Lumenia CRM" badge (supports free tool)
                    </label>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right panel: Live Preview & Action */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Preview Window */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-8">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-slate-400 text-xs font-semibold ml-2">Live Email Signature Preview</span>
                </div>

                {/* Render Signature visually */}
                <div className="p-4 border border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                  <div
                    ref={previewRef}
                    dangerouslySetInnerHTML={{ __html: getSignatureHtml() }}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-4 justify-end">
                <button
                  onClick={copyRichText}
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all min-w-[210px] justify-center"
                >
                  {copiedRich ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      Copied Signature!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy Signature (Rich Text)
                    </>
                  )}
                </button>
                <button
                  onClick={copySignatureHtml}
                  className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all min-w-[210px] justify-center"
                >
                  {copiedHtml ? (
                    <>
                      <Check size={14} className="text-emerald-400 animate-scale" />
                      Copied HTML Code!
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Copy HTML Source Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Growth / Upsell Banner */}
            <div className="bg-gradient-to-r from-brand-600 to-brand2-600 p-6 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-extrabold text-base">Want to send email campaigns with this signature?</h3>
                <p className="text-xs text-brand-100/90 leading-relaxed max-w-md mt-1 font-normal">
                  Connect your SMTP server, design automated follow-up sequences, and track your open/click analytics inside a free Lumenia CRM workspace.
                </p>
              </div>
              <Link
                href="/register"
                className="px-5 py-3 bg-white hover:bg-slate-50 text-brand-700 rounded-xl text-xs font-extrabold shadow-sm whitespace-nowrap transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Free Workspace
              </Link>
            </div>

          </div>
        </main>

        {/* SEO Copy & FAQs Section */}
        <section className="bg-white border-t border-slate-200 mt-20 py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="prose prose-slate max-w-none mb-16">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-6">
                Why a Professional Email Signature Matters
              </h2>
              <p className="text-slate-500 leading-relaxed font-normal mb-4">
                Every email you send is a representation of your personal brand and company identity. A poorly designed, cluttered signature looks unprofessional and might even trigger spam filters. On the other hand, a clean, styled HTML email signature builds trust, establishes authority, and increases traffic back to your primary social profiles and website.
              </p>
              <p className="text-slate-500 leading-relaxed font-normal mb-4">
                Our free signature generator constructs clean, table-based HTML, ensuring compatibility across all major email clients including Gmail, Outlook, Yahoo Mail, and Outlook Desktop.
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
                      <ChevronRight className={`text-slate-400 w-5 h-5 transition-transform duration-200 ${activeFaq === index ? 'rotate-90 text-brand-500' : ''}`} />
                    </button>
                    {activeFaq === index && (
                      <div className="px-6 pb-5 pt-2 text-slate-500 text-sm leading-relaxed border-t border-slate-100 font-normal whitespace-pre-line">
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
