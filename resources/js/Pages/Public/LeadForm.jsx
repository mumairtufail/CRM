import { Head, useForm, usePage } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Textarea } from '@/Components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/Components/ui/select'
import { Check, Zap, User, Building2, Mail, Phone, Globe, Briefcase, FileText } from 'lucide-react'

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
  'Manufacturing', 'Real Estate', 'Marketing', 'Legal', 'Consulting',
  'Media', 'Non-Profit', 'Government', 'Other',
]

function Field({ label, icon: Icon, error, required, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12.5px] font-medium text-slate-700 flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-slate-400" />}
        {label}{required && <span className="text-violet-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  )
}

function SuccessView() {
  return (
    <div className="text-center py-12 px-6">
      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
        <Check size={28} className="text-emerald-600" strokeWidth={2.5} />
      </div>
      <h2 className="text-[22px] font-bold text-slate-800 mb-2">Thank you!</h2>
      <p className="text-[14px] text-slate-500 max-w-xs mx-auto">
        Your information has been submitted successfully. We'll be in touch soon.
      </p>
    </div>
  )
}

export default function PublicLeadForm() {
  const { props } = usePage()
  const submitted  = props?.flash?.submitted ?? false

  const { data, setData, post, processing, errors } = useForm({
    first_name: '',
    last_name:  '',
    company:    '',
    job_title:  '',
    email:      '',
    phone:      '',
    website:    '',
    industry:   '',
    notes:      '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    post('/intake')
  }

  return (
    <>
      <Head title="Submit Your Information" />

      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }}>
              <Zap size={22} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-[24px] font-bold text-slate-900 tracking-tight">Submit Your Information</h1>
            <p className="text-[14px] text-slate-500 mt-1.5">
              Fill in the form below and we'll get back to you shortly.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 overflow-hidden">
            {submitted ? (
              <SuccessView />
            ) : (
              <form onSubmit={handleSubmit} className="p-7 space-y-5">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name" icon={User} required error={errors.first_name}>
                    <Input
                      value={data.first_name}
                      onChange={e => setData('first_name', e.target.value)}
                      placeholder="John"
                      className="h-10 text-[13.5px]"
                    />
                  </Field>
                  <Field label="Last Name" error={errors.last_name}>
                    <Input
                      value={data.last_name}
                      onChange={e => setData('last_name', e.target.value)}
                      placeholder="Smith"
                      className="h-10 text-[13.5px]"
                    />
                  </Field>
                </div>

                {/* Company + Job */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Company" icon={Building2} error={errors.company}>
                    <Input
                      value={data.company}
                      onChange={e => setData('company', e.target.value)}
                      placeholder="Acme Inc."
                      className="h-10 text-[13.5px]"
                    />
                  </Field>
                  <Field label="Job Title" icon={Briefcase} error={errors.job_title}>
                    <Input
                      value={data.job_title}
                      onChange={e => setData('job_title', e.target.value)}
                      placeholder="CEO"
                      className="h-10 text-[13.5px]"
                    />
                  </Field>
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Email Address" icon={Mail} required error={errors.email}>
                    <Input
                      type="email"
                      value={data.email}
                      onChange={e => setData('email', e.target.value)}
                      placeholder="john@acme.com"
                      className="h-10 text-[13.5px]"
                    />
                  </Field>
                  <Field label="Phone" icon={Phone} error={errors.phone}>
                    <Input
                      type="tel"
                      value={data.phone}
                      onChange={e => setData('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="h-10 text-[13.5px]"
                    />
                  </Field>
                </div>

                {/* Website + Industry */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Website" icon={Globe} error={errors.website}>
                    <Input
                      value={data.website}
                      onChange={e => setData('website', e.target.value)}
                      placeholder="https://acme.com"
                      className="h-10 text-[13.5px]"
                    />
                  </Field>
                  <Field label="Industry" error={errors.industry}>
                    <Select value={data.industry} onValueChange={v => setData('industry', v)}>
                      <SelectTrigger className="h-10 text-[13.5px]">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map(ind => (
                          <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                {/* Notes */}
                <Field label="Message / Notes" icon={FileText} error={errors.notes}>
                  <Textarea
                    value={data.notes}
                    onChange={e => setData('notes', e.target.value)}
                    placeholder="Tell us a little about what you're looking for…"
                    rows={3}
                    className="text-[13.5px] resize-none"
                  />
                </Field>

                <Button
                  type="submit"
                  disabled={processing}
                  className="w-full h-11 text-[14px] font-semibold gap-2"
                  style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }}
                >
                  {processing ? 'Submitting…' : 'Submit Information'}
                </Button>

                <p className="text-center text-[11px] text-slate-400">
                  Your information is kept private and will only be used to follow up with you.
                </p>
              </form>
            )}
          </div>

          {/* Embed note */}
          <p className="text-center text-[11.5px] text-slate-400 mt-5">
            Share this form via its public link or embed it on your website.
          </p>
        </div>
      </div>
    </>
  )
}
