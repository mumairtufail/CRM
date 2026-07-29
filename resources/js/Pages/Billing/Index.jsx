import { Head, usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import EmptyState from '@/Components/Common/EmptyState'
import { Badge } from '@/Components/ui/badge'
import { Button } from '@/Components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs'
import { Wallet, Receipt, Check, Download, ExternalLink } from 'lucide-react'
import { TIERS } from '@/lib/pricingTiers'
import { getPaddle } from '@/lib/paddle'

function StatusBadge({ status }) {
  const active = status === 'active'
  return <Badge variant={active ? 'default' : 'secondary'}>{active ? 'Active' : 'Inactive'}</Badge>
}

export default function BillingIndex({ plan, subscription, transactions, paddle, country }) {
  const { props } = usePage()
  const userEmail = props.auth?.user?.email
  const organizationId = props.organization?.id

  const [billingCycle, setBillingCycle] = useState('month')
  const [pricePreviews, setPricePreviews] = useState({})
  const [changingTier, setChangingTier] = useState(null)

  useEffect(() => {
    let cancelled = false
    getPaddle(paddle)
      .then((instance) => instance.PricePreview({
        items: TIERS.map((tier) => ({ priceId: tier.priceId[billingCycle], quantity: 1 })),
        ...(country ? { address: { countryCode: country } } : {}),
      }))
      .then((result) => {
        if (cancelled) return
        const lineItems = result?.data?.details?.lineItems || []
        const byPriceId = {}
        lineItems.forEach((item) => { byPriceId[item.price.id] = item.formattedTotals })
        setPricePreviews(byPriceId)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [billingCycle, country, paddle.environment, paddle.clientToken])

  const changePlan = (tier) => {
    setChangingTier(tier.slug)
    getPaddle(paddle)
      .then((instance) => {
        instance.Checkout.open({
          items: [{ priceId: tier.priceId[billingCycle], quantity: 1 }],
          customer: { email: userEmail },
          customData: { plan_slug: tier.slug, organization_id: organizationId },
          settings: {
            displayMode: 'overlay',
            variant: 'one-page',
            successUrl: `${window.location.origin}/billing`,
          },
        })
      })
      .finally(() => setChangingTier(null))
  }

  return (
    <>
      <Head title="Billing" />
      <PageHeader title="Billing & Invoices" description="Your plan, subscription status, and payment history." />

      <Tabs defaultValue="billing">
        <TabsList className="h-9 bg-slate-100/70 p-0.5 mb-4">
          <TabsTrigger value="billing" className="text-[12.5px] px-3.5 h-8 gap-1.5"><Wallet size={13} /> Billing</TabsTrigger>
          <TabsTrigger value="invoices" className="text-[12.5px] px-3.5 h-8 gap-1.5"><Receipt size={13} /> Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="billing" className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-slate-800">Current plan: {plan?.name || 'Free'}</p>
                {subscription?.scheduled_change_action && (
                  <p className="text-[12px] text-amber-600 mt-1">
                    Scheduled to {subscription.scheduled_change_action} on{' '}
                    {new Date(subscription.scheduled_change_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={plan?.status} />
                <a href="/settings/billing/portal">
                  <Button type="button" variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                    Manage billing <ExternalLink size={12} />
                  </Button>
                </a>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12.5px] font-semibold text-slate-600 uppercase tracking-wider">Change plan</p>
              <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200">
                {[['month', 'Monthly'], ['year', 'Yearly']].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setBillingCycle(value)}
                    className={`px-3 py-1 rounded-md text-[11.5px] font-semibold transition-all ${
                      billingCycle === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {TIERS.map((tier) => {
                const priceId = tier.priceId[billingCycle]
                const total = pricePreviews[priceId]?.total
                const isCurrent = subscription?.plan_slug === tier.slug
                return (
                  <div key={tier.slug} className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col">
                    <p className="text-[13px] font-bold text-slate-800">{tier.name}</p>
                    <p className="text-lg font-black text-slate-900 mt-1">
                      {total || '…'} <span className="text-[11px] font-medium text-slate-400">/{billingCycle === 'month' ? 'mo' : 'yr'}</span>
                    </p>
                    <div className="flex-1 space-y-1.5 my-3">
                      {tier.features.slice(0, 3).map((f) => (
                        <div key={f} className="flex items-start gap-1.5 text-[11.5px] text-slate-500">
                          <Check size={12} className="text-brand-500 shrink-0 mt-0.5" /> {f}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={isCurrent || changingTier === tier.slug}
                      onClick={() => changePlan(tier)}
                      className="h-8 text-xs w-full"
                    >
                      {isCurrent ? 'Current plan' : changingTier === tier.slug ? 'Opening…' : 'Switch to this plan'}
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          {transactions.data.length === 0 ? (
            <EmptyState icon={Receipt} title="No invoices yet" description="Invoices appear here once your first payment is processed." />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left font-semibold text-slate-500 px-4 py-2.5">Date</th>
                    <th className="text-left font-semibold text-slate-500 px-4 py-2.5">Plan</th>
                    <th className="text-left font-semibold text-slate-500 px-4 py-2.5">Amount</th>
                    <th className="text-left font-semibold text-slate-500 px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.data.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-2.5 text-slate-600">{t.billed_at ? new Date(t.billed_at).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-2.5 text-slate-600 capitalize">{t.plan_slug || '—'}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{t.total}</td>
                      <td className="px-4 py-2.5"><Badge variant={t.status === 'completed' || t.status === 'paid' ? 'default' : 'secondary'}>{t.status}</Badge></td>
                      <td className="px-4 py-2.5 text-right">
                        <a href={`/billing/invoices/${t.id}/download`} className="inline-flex items-center gap-1 text-brand-600 text-[11.5px] font-medium hover:underline">
                          <Download size={12} /> Invoice
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  )
}

BillingIndex.layout = (page) => <AppLayout children={page} />
