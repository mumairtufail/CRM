import { Head } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import { CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react'

export default function WhatsappStatus({ enabled, planType, quota, usedThisMonth, lastVerifiedAt }) {
  return (
    <>
      <Head title="WhatsApp Status" />
      <AppLayout title="WhatsApp">
        <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-4">
          <div>
            <h1 className="text-[18px] font-bold text-slate-800 flex items-center gap-2">
              <MessageCircle size={18} className="text-emerald-500" /> WhatsApp
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5">Status of WhatsApp messaging for your workspace</p>
          </div>

          <div className={`flex items-start gap-2.5 rounded-xl px-4 py-3.5 border ${enabled ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
            {enabled
              ? <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
              : <AlertCircle  size={16} className="text-slate-400 mt-0.5 shrink-0" />}
            <div>
              <p className={`text-[13.5px] font-medium ${enabled ? 'text-emerald-800' : 'text-slate-600'}`}>
                {enabled ? 'WhatsApp is active on your account' : "WhatsApp isn't active on your account yet"}
              </p>
              <p className="text-[12.5px] text-slate-500 mt-1 leading-relaxed">
                {enabled
                  ? 'Send and receive WhatsApp messages from the Conversations inbox. There is nothing for you to configure — this runs on our shared, managed WhatsApp number.'
                  : 'This feature is not enabled for your workspace yet. Contact your account manager or support to turn it on.'}
              </p>
            </div>
          </div>

          {enabled && (
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">This month</p>
              <div className="flex items-center justify-between text-[13.5px]">
                <span className="text-slate-500">Plan</span>
                <span className="font-semibold text-slate-800 capitalize">{planType ?? 'trial'}</span>
              </div>
              <div className="flex items-center justify-between text-[13.5px]">
                <span className="text-slate-500">Messages sent</span>
                <span className="font-semibold text-slate-800">
                  {usedThisMonth ?? 0}{quota ? ` of ${quota}` : ''}
                </span>
              </div>
              {quota && (
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{ width: `${Math.min(100, ((usedThisMonth ?? 0) / quota) * 100)}%` }}
                  />
                </div>
              )}
              {lastVerifiedAt && (
                <p className="text-[11.5px] text-slate-400 pt-1">
                  Platform connection last verified {new Date(lastVerifiedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  )
}
