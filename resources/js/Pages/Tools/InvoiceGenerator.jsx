import { Head, Link } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2, Printer, Download, Sparkles, AlertCircle, ChevronRight } from 'lucide-react'
import Logo, { LogoMark } from '@/Components/Common/Logo'

export default function InvoiceGenerator({ latestBlogs = [] }) {
  const [activeFaq, setActiveFaq] = useState(null)
  
  // Invoice state
  const [invoice, setInvoice] = useState({
    invoiceNumber: 'INV-2026-001',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: '$',
    companyName: 'Your Company Name',
    companyEmail: 'billing@yourcompany.com',
    companyPhone: '+1 (555) 019-2834',
    companyAddress: '123 Business Rd, Suite 100\nNew York, NY 10001',
    clientName: 'Client Company LLC',
    clientEmail: 'accounts@client.com',
    clientAddress: '456 Tech Boulevard\nSan Francisco, CA 94107',
    items: [
      { id: 1, description: 'Premium B2B Lead List Generation', quantity: 1, price: 1200 },
      { id: 2, description: 'Outbound Cold Email Sequence Setup', quantity: 1, price: 800 },
    ],
    taxRate: 10, // 10%
    notes: 'Thank you for your business! Please pay within 14 days of receiving this invoice.',
  })

  // Calculations
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const taxAmount = (subtotal * (invoice.taxRate / 100))
  const total = subtotal + taxAmount

  const handleInvoiceChange = (field, value) => {
    setInvoice(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleItemChange = (id, field, value) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const parsedVal = field === 'description' ? value : Number(value) || 0
          return { ...item, [field]: parsedVal }
        }
        return item
      })
    }))
  }

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now(), description: 'New Line Item', quantity: 1, price: 0 }
      ]
    }))
  }

  const deleteItem = (id) => {
    if (invoice.items.length <= 1) return
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

  // Trigger print dialog (which users can use to save as PDF)
  const handlePrint = () => {
    window.print()
  }

  const faqs = [
    {
      q: "How do I save this invoice as a PDF?",
      a: "Click the 'Download PDF' or 'Print Invoice' button. In the system print dialog that opens, select 'Save as PDF' or 'Microsoft Print to PDF' in the destination dropdown, then click Save."
    },
    {
      q: "What makes an invoice legally binding?",
      a: "An invoice is legally binding when it contains specific required information: a unique invoice number, dates of issuance/payment terms, client and seller details, itemized lists of services or products, quantities, tax breakdowns, and final payment details."
    },
    {
      q: "Can I automatically send and track invoices inside a CRM?",
      a: "Yes! In Lumenia CRM, you can generate invoices directly from won deals. The system auto-numbers invoices, emails the client a secure payment link, and sends automatic follow-up reminders if the invoice becomes overdue."
    }
  ]

  return (
    <>
      <Head>
        <title>Free Online Invoice Generator · Lumenia CRM</title>
        <meta name="description" content="Generate professional PDF invoices for clients instantly. Customize invoice fields, calculate taxes, add items, and download/print for free. No signup needed." />
      </Head>

      <div className="min-h-screen bg-[#F8F9FD] font-sans antialiased text-slate-800 flex flex-col justify-between print:bg-white print:p-0">
        
        {/* Header - hide on print */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-50 print:hidden">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/tools" className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition-colors">
                <ArrowLeft size={18} />
              </Link>
              <Link href="/" className="flex items-center gap-2">
                <Logo size={28} showText={true} text="LumeniaCRM" textClassName="text-[15px] font-extrabold" />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">
                <Sparkles size={11} className="fill-indigo-700" />
                No Account Required
              </span>
              <Link
                href="/register"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Sign up for CRM
              </Link>
            </div>
          </div>
        </header>

        {/* Builder Area */}
        <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full grid grid-cols-1 gap-8 print:py-0 print:px-0">
          
          {/* Instructions banner - hide on print */}
          <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 flex gap-3 text-amber-800 items-start print:hidden">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold">Pro Tip:</span> This tool works directly in your browser. Click on any text, input field, or number inside the invoice below to edit the content. When you are done, click <strong>Download PDF / Print</strong>.
            </div>
          </div>

          {/* Invoice Document Wrapper */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 md:p-12 print:border-0 print:shadow-none print:p-0">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between gap-8 border-b border-slate-100 pb-10 mb-10">
              {/* Left Side: Brand and Issuer */}
              <div className="space-y-4 max-w-sm">
                <input
                  type="text"
                  value={invoice.companyName}
                  onChange={(e) => handleInvoiceChange('companyName', e.target.value)}
                  className="text-2xl font-black text-slate-800 border-b border-transparent hover:border-slate-200 focus:border-violet-500 w-full focus:outline-none py-1"
                />
                <div className="space-y-1.5 text-sm text-slate-500">
                  <input
                    type="email"
                    value={invoice.companyEmail}
                    onChange={(e) => handleInvoiceChange('companyEmail', e.target.value)}
                    className="block w-full border-b border-transparent hover:border-slate-200 focus:border-violet-500 focus:outline-none py-0.5"
                    placeholder="email@company.com"
                  />
                  <input
                    type="text"
                    value={invoice.companyPhone}
                    onChange={(e) => handleInvoiceChange('companyPhone', e.target.value)}
                    className="block w-full border-b border-transparent hover:border-slate-200 focus:border-violet-500 focus:outline-none py-0.5"
                    placeholder="Phone"
                  />
                  <textarea
                    value={invoice.companyAddress}
                    onChange={(e) => handleInvoiceChange('companyAddress', e.target.value)}
                    rows={2}
                    className="block w-full border-b border-transparent hover:border-slate-200 focus:border-violet-500 focus:outline-none py-0.5 resize-none"
                    placeholder="Address"
                  />
                </div>
              </div>

              {/* Right Side: Title & Invoice Meta */}
              <div className="md:text-right space-y-4 max-w-xs md:ml-auto">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-400 uppercase select-none">INVOICE</h1>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-500 md:justify-items-end">
                  <span className="font-semibold text-slate-400">Invoice No:</span>
                  <input
                    type="text"
                    value={invoice.invoiceNumber}
                    onChange={(e) => handleInvoiceChange('invoiceNumber', e.target.value)}
                    className="border-b border-transparent hover:border-slate-200 focus:border-violet-500 focus:outline-none py-0.5 text-right font-bold text-slate-700 w-32"
                  />

                  <span className="font-semibold text-slate-400">Date:</span>
                  <input
                    type="date"
                    value={invoice.date}
                    onChange={(e) => handleInvoiceChange('date', e.target.value)}
                    className="border-b border-transparent hover:border-slate-200 focus:border-violet-500 focus:outline-none py-0.5 text-right w-32"
                  />

                  <span className="font-semibold text-slate-400">Due Date:</span>
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => handleInvoiceChange('dueDate', e.target.value)}
                    className="border-b border-transparent hover:border-slate-200 focus:border-violet-500 focus:outline-none py-0.5 text-right w-32"
                  />

                  <span className="font-semibold text-slate-400">Currency:</span>
                  <select
                    value={invoice.currency}
                    onChange={(e) => handleInvoiceChange('currency', e.target.value)}
                    className="border-b border-transparent hover:border-slate-200 focus:border-violet-500 focus:outline-none py-0.5 text-right w-16 bg-white"
                  >
                    <option value="$">USD ($)</option>
                    <option value="€">EUR (€)</option>
                    <option value="£">GBP (£)</option>
                    <option value="₨">PKR (₨)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-100 pb-10 mb-10">
              <div className="space-y-3">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block select-none">Billed To:</span>
                <input
                  type="text"
                  value={invoice.clientName}
                  onChange={(e) => handleInvoiceChange('clientName', e.target.value)}
                  className="text-lg font-bold text-slate-800 border-b border-transparent hover:border-slate-200 focus:border-violet-500 focus:outline-none py-1 w-full"
                  placeholder="Client Name"
                />
                <div className="space-y-1.5 text-sm text-slate-500">
                  <input
                    type="email"
                    value={invoice.clientEmail}
                    onChange={(e) => handleInvoiceChange('clientEmail', e.target.value)}
                    className="block w-full border-b border-transparent hover:border-slate-200 focus:border-violet-500 focus:outline-none py-0.5"
                    placeholder="client@email.com"
                  />
                  <textarea
                    value={invoice.clientAddress}
                    onChange={(e) => handleInvoiceChange('clientAddress', e.target.value)}
                    rows={2}
                    className="block w-full border-b border-transparent hover:border-slate-200 focus:border-violet-500 focus:outline-none py-0.5 resize-none"
                    placeholder="Client Address"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto mb-10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-xs font-extrabold uppercase select-none">
                    <th className="pb-3 w-[60%]">Description</th>
                    <th className="pb-3 text-center">Qty</th>
                    <th className="pb-3 text-right">Price</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-center print:hidden w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="group">
                      <td className="py-4 pr-4">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          className="w-full border-b border-transparent hover:border-slate-100 focus:border-violet-500 focus:outline-none py-1 text-sm text-slate-800"
                        />
                      </td>
                      <td className="py-4 text-center">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                          className="w-16 border-b border-transparent hover:border-slate-100 focus:border-violet-500 focus:outline-none py-1 text-center text-sm text-slate-800"
                          min="1"
                        />
                      </td>
                      <td className="py-4 text-right">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                          className="w-20 border-b border-transparent hover:border-slate-100 focus:border-violet-500 focus:outline-none py-1 text-right text-sm text-slate-800"
                          min="0"
                        />
                      </td>
                      <td className="py-4 text-right text-sm font-semibold text-slate-800 select-none">
                        {invoice.currency}{(item.quantity * item.price).toLocaleString()}
                      </td>
                      <td className="py-4 text-center print:hidden">
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-slate-300 hover:text-rose-500 p-1 rounded-md transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table actions - hide on print */}
            <button
              onClick={addItem}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-lg text-xs font-bold transition-all shadow-sm mb-10 print:hidden"
            >
              <Plus size={14} /> Add Line Item
            </button>

            {/* Calculations & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
              {/* Notes */}
              <div className="md:col-span-7 space-y-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block select-none">Notes / Terms:</span>
                <textarea
                  value={invoice.notes}
                  onChange={(e) => handleInvoiceChange('notes', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-4 text-xs text-slate-500 focus:outline-none focus:border-violet-500 resize-none h-24 print:border-0 print:p-0 print:text-slate-600"
                  placeholder="Payment details, IBAN, bank name, etc."
                />
              </div>

              {/* Totals */}
              <div className="md:col-span-5 border-t border-slate-100 pt-6 md:pt-0 md:border-0 space-y-3.5 text-sm text-slate-500 select-none">
                <div className="flex justify-between items-center">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">{invoice.currency}{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span>Tax:</span>
                    <input
                      type="number"
                      value={invoice.taxRate}
                      onChange={(e) => handleInvoiceChange('taxRate', Number(e.target.value) || 0)}
                      className="w-10 border-b border-transparent hover:border-slate-100 focus:border-violet-500 focus:outline-none text-center font-semibold text-slate-700 bg-white print:hidden"
                    />
                    <span className="hidden print:inline-block font-semibold">({invoice.taxRate}%)</span>
                    <span>%</span>
                  </div>
                  <span className="font-semibold text-slate-800">{invoice.currency}{taxAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 pt-4 text-base font-extrabold text-slate-800">
                  <span>Total Amount Due:</span>
                  <span className="text-xl text-violet-700">{invoice.currency}{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Action Hub - hide on print */}
          <div className="flex flex-wrap gap-4 justify-end mt-4 print:hidden">
            <button
              onClick={handlePrint}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-2 transition-all"
            >
              <Printer size={16} /> Print / Save as PDF
            </button>
          </div>

          {/* Upsell box - hide on print */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden mt-8">
            <div>
              <h3 className="font-extrabold text-base">Want automated invoice tracking and payments?</h3>
              <p className="text-xs text-violet-100/90 leading-relaxed max-w-lg mt-1 font-normal">
                Generate professional PDF invoices directly from client pages. Auto-track payment dates, integrate online payment processors, and get automated system follow-up alerts when accounts go overdue.
              </p>
            </div>
            <Link
              href="/register"
              className="px-5 py-3 bg-white hover:bg-slate-50 text-violet-700 rounded-xl text-xs font-extrabold shadow-sm whitespace-nowrap transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Lumenia CRM Free
            </Link>
          </div>

        </main>

        {/* SEO Copy & FAQs Section - hide on print */}
        <section className="bg-white border-t border-slate-200 mt-20 py-20 print:hidden">
          <div className="max-w-4xl mx-auto px-6">
            <div className="prose prose-slate max-w-none mb-16">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-6">
                Professional Invoice Creation Made Simple
              </h2>
              <p className="text-slate-500 leading-relaxed font-normal mb-4">
                Creating invoices shouldn't involve fighting spreadsheet templates or word processors. A professional invoice sets the tone for your client relationships, provides legal clarity for taxes, and ensures you get paid on time.
              </p>
              <p className="text-slate-500 leading-relaxed font-normal mb-4">
                This free tool lets freelancers, consultants, agencies, and small businesses quickly draft, check, and generate invoices with automated tax calculators on the fly.
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
                      <ChevronRight className={`text-slate-400 w-5 h-5 transition-transform duration-200 ${activeFaq === index ? 'rotate-90 text-violet-500' : ''}`} />
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

        {/* Footer - hide on print */}
        <footer style={{ background: '#030208' }} className="border-t border-white/5 w-full print:hidden">
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
