import { Head } from '@inertiajs/react'
import { useState } from 'react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs'
import { MessageCircle, ToggleLeft, Inbox } from 'lucide-react'
import SettingsTab from './Partials/SettingsTab'
import TenantsTab from './Partials/TenantsTab'
import InboundTab from './Partials/InboundTab'

export default function AdminWhatsappIndex({
  credential, auditLog, organizations, tenantFilters, platformCredentialActive, inbound,
}) {
  const [tab, setTab] = useState('settings')

  return (
    <>
      <Head title="Admin · WhatsApp" />
      <AdminLayout title="WhatsApp">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-5">
            <TabsTrigger value="settings" className="gap-1.5">
              <MessageCircle size={13} /> Settings
            </TabsTrigger>
            <TabsTrigger value="tenants" className="gap-1.5">
              <ToggleLeft size={13} /> Tenants
            </TabsTrigger>
            <TabsTrigger value="inbound" className="gap-1.5">
              <Inbox size={13} /> Inbound
              {inbound.data.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
                  {inbound.total}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <SettingsTab credential={credential} auditLog={auditLog} />
          </TabsContent>
          <TabsContent value="tenants">
            <TenantsTab organizations={organizations} filters={tenantFilters} platformCredentialActive={platformCredentialActive} />
          </TabsContent>
          <TabsContent value="inbound">
            <InboundTab inbound={inbound} />
          </TabsContent>
        </Tabs>
      </AdminLayout>
    </>
  )
}
