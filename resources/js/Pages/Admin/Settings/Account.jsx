import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Button } from '@/Components/ui/button'
import { ChevronRight, User, Lock, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
          <Icon size={14} className="text-violet-600" />
        </div>
        <h2 className="text-[13.5px] font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

export default function AdminSettingsAccount({ user }) {
  const { props } = usePage()
  const flash = props?.flash

  useEffect(() => {
    if (flash?.success) toast.success(flash.success)
    if (flash?.error)   toast.error(flash.error)
  }, [flash?.success, flash?.error])

  const profileForm = useForm({ name: user.name, email: user.email })
  const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' })

  const saveProfile = (e) => {
    e.preventDefault()
    profileForm.patch('/admin/settings/account', { preserveScroll: true })
  }

  const savePassword = (e) => {
    e.preventDefault()
    passwordForm.patch('/admin/settings/account/password', {
      preserveScroll: true,
      onSuccess: () => passwordForm.reset(),
    })
  }

  return (
    <>
      <Head title="Admin · Account" />
      <AdminLayout title="Settings · Account">

        <div className="max-w-2xl mx-auto py-6 px-2">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-5">
            <Link href="/admin/settings" className="hover:text-violet-600 transition-colors">Settings</Link>
            <ChevronRight size={11} />
            <span className="text-slate-600 font-medium">Account</span>
          </nav>

          <h1 className="text-[20px] font-bold text-slate-800 mb-5">Account</h1>

          <div className="flex flex-col gap-4">

            {/* Profile */}
            <Section icon={User} title="Profile">
              <form onSubmit={saveProfile} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="name" className="text-[12px] font-medium text-slate-600">Name</Label>
                    <Input
                      id="name"
                      value={profileForm.data.name}
                      onChange={e => profileForm.setData('name', e.target.value)}
                      className="h-9 text-[13px]"
                    />
                    {profileForm.errors.name && (
                      <p className="text-[11.5px] text-red-500">{profileForm.errors.name}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email" className="text-[12px] font-medium text-slate-600">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.data.email}
                      onChange={e => profileForm.setData('email', e.target.value)}
                      className="h-9 text-[13px]"
                    />
                    {profileForm.errors.email && (
                      <p className="text-[11.5px] text-red-500">{profileForm.errors.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={profileForm.processing} size="sm"
                    className="bg-violet-600 hover:bg-violet-700 text-white h-8 px-4 text-[12.5px]">
                    {profileForm.processing ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </form>
            </Section>

            {/* Password */}
            <Section icon={Lock} title="Change password">
              <form onSubmit={savePassword} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="current_password" className="text-[12px] font-medium text-slate-600">Current password</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={passwordForm.data.current_password}
                    onChange={e => passwordForm.setData('current_password', e.target.value)}
                    className="h-9 text-[13px]"
                  />
                  {passwordForm.errors.current_password && (
                    <p className="text-[11.5px] text-red-500">{passwordForm.errors.current_password}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password" className="text-[12px] font-medium text-slate-600">New password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={passwordForm.data.password}
                      onChange={e => passwordForm.setData('password', e.target.value)}
                      className="h-9 text-[13px]"
                    />
                    {passwordForm.errors.password && (
                      <p className="text-[11.5px] text-red-500">{passwordForm.errors.password}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password_confirmation" className="text-[12px] font-medium text-slate-600">Confirm password</Label>
                    <Input
                      id="password_confirmation"
                      type="password"
                      value={passwordForm.data.password_confirmation}
                      onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                      className="h-9 text-[13px]"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={passwordForm.processing} size="sm"
                    className="bg-violet-600 hover:bg-violet-700 text-white h-8 px-4 text-[12.5px]">
                    {passwordForm.processing ? 'Saving…' : 'Update password'}
                  </Button>
                </div>
              </form>
            </Section>

          </div>
        </div>

      </AdminLayout>
    </>
  )
}
