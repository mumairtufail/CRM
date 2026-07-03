import { Head, Link, useForm, usePage } from '@inertiajs/react'
import { useState, useEffect, useRef } from 'react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Button } from '@/Components/ui/button'
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from '@/Components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/Components/ui/dialog'
import { LogoMark } from '@/Components/Common/Logo'
import { toast } from 'sonner'
import axios from 'axios'
import { cn } from '@/lib/utils'
import {
  Search, User, Mail, ChevronRight, Image as ImageIcon, Cpu, Globe,
  Lock, CheckCircle2, AlertCircle, Eye, EyeOff, Send, Loader2, Zap,
  Upload, RefreshCw, Download, FileText, ShieldAlert, Key, Save, Trash2
} from 'lucide-react'

// SMTP presets definition
const SMTP_PRESETS = [
  {
    id: 'gmail',
    label: 'Gmail',
    color: '#EA4335',
    logo: (
      <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M5 38.5v-29L22 24z"/>
        <path fill="#FBBC05" d="M43 38.5v-29L26 24z"/>
        <path fill="#34A853" d="M43 9.5l-19 14.5L5 9.5"/>
        <path fill="#4285F4" d="M5 38.5h38v3H5z"/>
        <path fill="#C5221F" d="M5 9.5h38l-19 14.5z"/>
      </svg>
    ),
    host: 'smtp.gmail.com',
    port: 587,
    encryption: 'tls',
    hint: 'Use an App Password — not your Google account password.',
  },
  {
    id: 'outlook',
    label: 'Outlook',
    color: '#0078D4',
    logo: (
      <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="6" fill="#0078D4"/>
        <path fill="#fff" d="M14 14h20v20H14z" opacity=".3"/>
        <path fill="#fff" d="M12 12h24v4H12zm0 6h24v2H12zm0 4h14v2H12zm0 4h14v2H12zm0 4h14v2H12z"/>
      </svg>
    ),
    host: 'smtp-mail.outlook.com',
    port: 587,
    encryption: 'tls',
    hint: 'Works for Outlook.com and Microsoft 365 accounts.',
  },
  {
    id: 'sendgrid',
    label: 'SendGrid',
    color: '#1A82E2',
    logo: (
      <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="6" fill="#1A82E2"/>
        <rect x="10" y="10" width="13" height="13" rx="2" fill="#fff" opacity=".9"/>
        <rect x="25" y="10" width="13" height="13" rx="2" fill="#fff" opacity=".4"/>
        <rect x="10" y="25" width="13" height="13" rx="2" fill="#fff" opacity=".4"/>
        <rect x="25" y="25" width="13" height="13" rx="2" fill="#fff" opacity=".9"/>
      </svg>
    ),
    host: 'smtp.sendgrid.net',
    port: 587,
    encryption: 'tls',
    usernameHint: 'Use "apikey" as the username and your SendGrid API key as the password.',
    prefillUsername: 'apikey',
  },
  {
    id: 'mailgun',
    label: 'Mailgun',
    color: '#F06B26',
    logo: (
      <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="6" fill="#F06B26"/>
        <circle cx="24" cy="24" r="10" fill="#fff" opacity=".9"/>
        <circle cx="24" cy="24" r="5" fill="#F06B26"/>
      </svg>
    ),
    host: 'smtp.mailgun.org',
    port: 587,
    encryption: 'tls',
    hint: 'Use your Mailgun SMTP credentials from the Mailgun dashboard.',
  },
  {
    id: 'ses',
    label: 'Amazon SES',
    color: '#FF9900',
    logo: (
      <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="6" fill="#232F3E"/>
        <path fill="#FF9900" d="M8 30c0 1.1.9 2 2 2h28c1.1 0 2-.9 2-2v-4H8v4zm32-14H8v4h32v-4z"/>
        <rect x="8" y="16" width="32" height="4" rx="2" fill="#FF9900" opacity=".7"/>
      </svg>
    ),
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    encryption: 'tls',
    hint: 'Use SMTP credentials (not access keys) from the SES console.',
  },
  {
    id: 'hostinger',
    label: 'Hostinger',
    color: '#673DE6',
    logo: (
      <div className="w-[14px] h-[14px] bg-[#673DE6] rounded flex items-center justify-center text-white text-[9px] font-bold">
        H
      </div>
    ),
    host: 'smtp.hostinger.com',
    port: 587,
    encryption: 'tls',
    hint: 'Use your Hostinger email address and its password as SMTP credentials.',
  },
  {
    id: 'custom',
    label: 'Custom',
    color: '#7C3AED',
    logo: (
      <div className="w-[14px] h-[14px] rounded flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
        <Zap size={8} className="text-white" />
      </div>
    ),
    host: '',
    port: 587,
    encryption: 'tls',
  },
]

// List of settings fields to map keywords for search functionality
const SETTINGS_FIELDS = [
  { id: 'profile_name', label: 'Name', description: 'Admin display name', tab: 'account', keywords: ['name', 'profile', 'user'] },
  { id: 'profile_email', label: 'Email', description: 'Admin login and notification email', tab: 'account', keywords: ['email', 'profile', 'user'] },
  { id: 'profile_password', label: 'Password', description: 'Change admin password', tab: 'account', keywords: ['password', 'security', 'login'] },
  
  { id: 'smtp_preset', label: 'SMTP Provider Preset', description: 'Quick configuration presets (Gmail, Outlook, SendGrid, etc.)', tab: 'smtp', keywords: ['preset', 'gmail', 'outlook', 'sendgrid', 'smtp', 'mailgun', 'ses', 'hostinger'] },
  { id: 'smtp_host', label: 'SMTP Host', description: 'Outgoing mail server address', tab: 'smtp', keywords: ['smtp', 'host', 'server', 'address', 'mail'] },
  { id: 'smtp_port', label: 'SMTP Port', description: 'SMTP server port (e.g. 587, 465)', tab: 'smtp', keywords: ['smtp', 'port', 'mail'] },
  { id: 'smtp_encryption', label: 'SMTP Encryption', description: 'TLS, SSL, or None security protocol', tab: 'smtp', keywords: ['smtp', 'encryption', 'tls', 'ssl', 'security'] },
  { id: 'smtp_username', label: 'SMTP Username', description: 'SMTP authentication username', tab: 'smtp', keywords: ['smtp', 'username', 'login'] },
  { id: 'smtp_password', label: 'SMTP Password', description: 'SMTP authentication password or API key', tab: 'smtp', keywords: ['smtp', 'password', 'key', 'credential'] },
  { id: 'smtp_from_name', label: 'SMTP From Name', description: 'Display name for outbound emails', tab: 'smtp', keywords: ['from', 'name', 'sender'] },
  { id: 'smtp_from_email', label: 'SMTP From Email', description: 'Sender email address', tab: 'smtp', keywords: ['from', 'email', 'sender'] },
  { id: 'smtp_test', label: 'Send Test Email', description: 'Test the SMTP settings by sending a diagnostic email', tab: 'smtp', keywords: ['test', 'diagnostic', 'verify', 'send'] },
  
  { id: 'logo_upload', label: 'Custom Logo Upload', description: 'Upload a custom logo to brand your app', tab: 'branding', keywords: ['logo', 'upload', 'branding', 'image', 'png', 'svg'] },
  { id: 'branding_assets', label: 'Download Branding Assets', description: 'Download default high-resolution branding assets', tab: 'branding', keywords: ['logo', 'svg', 'png', 'download', 'branding', 'assets'] },
  
  { id: 'ai_provider', label: 'AI Provider', description: 'Choose OpenAI, Anthropic, or Kimi', tab: 'ai', keywords: ['ai', 'provider', 'openai', 'anthropic', 'kimi', 'claude', 'nvidia', 'deepseek', 'model'] },
  { id: 'ai_api_key', label: 'AI API Key', description: 'API key for the selected AI service provider', tab: 'ai', keywords: ['ai', 'key', 'api', 'token', 'credential'] },
  { id: 'ai_model', label: 'AI Model', description: 'Model to use (e.g., GPT-4o, Claude 3.5 Sonnet)', tab: 'ai', keywords: ['ai', 'model', 'gpt', 'claude', 'kimi', 'nemotron', 'llama', 'deepseek'] },
  { id: 'ai_base_url', label: 'AI Base URL', description: 'Custom API endpoint url (optional)', tab: 'ai', keywords: ['ai', 'url', 'endpoint', 'base', 'proxy'] },
  { id: 'ai_active', label: 'AI Active Status', description: 'Enable or disable AI capabilities', tab: 'ai', keywords: ['ai', 'active', 'status', 'enable'] },
  { id: 'ai_test', label: 'AI Connection Test', description: 'Run connection diagnostics to verify API settings', tab: 'ai', keywords: ['ai', 'test', 'diagnostic', 'verify'] },
  
  { id: 'seo_title', label: 'SEO Meta Title', description: 'Default HTML meta title tag', tab: 'seo', keywords: ['seo', 'title', 'meta', 'header'] },
  { id: 'seo_description', label: 'SEO Meta Description', description: 'Default HTML meta description tag', tab: 'seo', keywords: ['seo', 'description', 'meta'] },
  { id: 'seo_keywords', label: 'SEO Keywords', description: 'Default fallback SEO keywords list', tab: 'seo', keywords: ['seo', 'keywords', 'meta', 'tags'] },
  { id: 'seo_robots', label: 'Robots.txt Configuration', description: 'Robots rules for web crawlers', tab: 'seo', keywords: ['seo', 'robots', 'txt', 'crawl', 'indexing'] },
  { id: 'seo_sitemap', label: 'Sitemap Status', description: 'Dynamic sitemap.xml validation link', tab: 'seo', keywords: ['seo', 'sitemap', 'xml', 'google', 'crawl'] },
]

export default function AdminSettings({ user, custom_logo_url, setting, models, seo, app_url, smtp, configured }) {
  const { props } = usePage()
  const flash = props?.flash

  // Auto-detect tab query parameter from URL
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('tab') || 'account'
  })

  const [query, setQuery] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  // SMTP test states
  const [smtpTestLoading, setSmtpTestLoading] = useState(false)
  const [showSmtpTestDialog, setShowSmtpTestDialog] = useState(false)
  const [testToEmail, setTestToEmail] = useState('')
  const [activeSmtpPreset, setActiveSmtpPreset] = useState(null)
  const [smtpHint, setSmtpHint] = useState(null)

  // AI Connection diagnostics states
  const [testingAi, setTestingAi] = useState(false)
  const [aiTestResult, setAiTestResult] = useState(null)

  // Branding Refs
  const fileInputRef = useRef(null)
  const svgRef = useRef(null)

  // Initialize Isolated Forms
  const profileForm = useForm({ name: user?.name || '', email: user?.email || '' })
  const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' })
  const uploadLogoForm = useForm({ logo: null })
  const resetLogoForm = useForm()

  const aiForm = useForm({
    provider: setting?.provider || 'openai',
    api_key: setting?.api_key || '',
    model: setting?.model || '',
    base_url: setting?.base_url || '',
    is_active: !!setting?.is_active,
  })

  const seoForm = useForm({
    meta_title: seo?.meta_title || '',
    meta_description: seo?.meta_description || '',
    meta_keywords: seo?.meta_keywords || '',
    robots_txt: seo?.robots_txt || "User-agent: *\nDisallow:",
  })

  const smtpForm = useForm({
    host: smtp?.host ?? '',
    port: smtp?.port ?? 587,
    encryption: smtp?.encryption ?? 'tls',
    username: smtp?.username ?? '',
    password: '',
    from_name: smtp?.from_name ?? '',
    from_email: smtp?.from_email ?? '',
  })

  // Flash Notifications
  useEffect(() => {
    if (flash?.success) toast.success(flash.success)
    if (flash?.error) toast.error(flash.error)
  }, [flash?.success, flash?.error])

  // AI Form dynamic model auto-select
  useEffect(() => {
    const providerModels = models[aiForm.data.provider] || []
    if (providerModels.length > 0 && !providerModels.some(m => m.id === aiForm.data.model)) {
      aiForm.setData('model', providerModels[0].id)
    }
  }, [aiForm.data.provider])

  // Sync tab switching to url
  const changeTab = (tab) => {
    setActiveTab(tab)
    window.history.pushState(null, '', `/admin/settings?tab=${tab}`)
  }

  // Search logic helper
  const getMatchCountForTab = (tabId) => {
    if (!query.trim()) return 0
    const q = query.toLowerCase()
    return SETTINGS_FIELDS.filter(f => 
      f.tab === tabId && 
      (f.label.toLowerCase().includes(q) || 
       f.description.toLowerCase().includes(q) || 
       f.keywords.some(k => k.toLowerCase().includes(q)))
    ).length
  }

  const isFieldMatched = (fieldId) => {
    if (!query.trim()) return false
    const q = query.toLowerCase()
    const field = SETTINGS_FIELDS.find(f => f.id === fieldId)
    if (!field) return false
    return field.label.toLowerCase().includes(q) || 
           field.description.toLowerCase().includes(q) || 
           field.keywords.some(k => k.toLowerCase().includes(q))
  }

  // Handlers for Account
  const saveProfile = (e) => {
    e.preventDefault()
    profileForm.patch(route('admin.settings.account.update'), {
      preserveScroll: true,
      onSuccess: () => toast.success('Profile updated successfully.')
    })
  }

  const savePassword = (e) => {
    e.preventDefault()
    passwordForm.patch(route('admin.settings.account.password'), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Password updated successfully.')
        passwordForm.reset()
      }
    })
  }

  // Handlers for SMTP
  const applySmtpPreset = (preset) => {
    setActiveSmtpPreset(preset.id)
    setSmtpHint(preset.usernameHint || preset.hint || null)
    smtpForm.setData(prev => ({
      ...prev,
      host: preset.host || prev.host,
      port: preset.port || prev.port,
      encryption: preset.encryption || prev.encryption,
      username: preset.prefillUsername ?? prev.username,
    }))
  }

  const saveSmtp = (e) => {
    e.preventDefault()
    smtpForm.post(route('admin.smtp.update'), {
      preserveScroll: true,
      onSuccess: () => toast.success('SMTP settings saved successfully.'),
      onError: () => toast.error('Please fix the errors below.')
    })
  }

  const sendSmtpTest = async () => {
    if (!testToEmail) return
    setSmtpTestLoading(true)
    setShowSmtpTestDialog(false)
    try {
      const res = await fetch(route('admin.smtp.test'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ to: testToEmail }),
      })
      const json = await res.json()
      if (json.ok) toast.success(json.message)
      else toast.error(json.message)
    } catch {
      toast.error('Failed to send test email.')
    } finally {
      setSmtpTestLoading(false)
    }
  }

  // Handlers for Branding
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB.')
      return
    }
    uploadLogoForm.setData('logo', file)
  }

  const uploadLogo = (e) => {
    e.preventDefault()
    if (!uploadLogoForm.data.logo) return
    uploadLogoForm.post(route('admin.settings.branding.update'), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Branding logo uploaded successfully!')
        uploadLogoForm.reset()
      },
      onError: () => toast.error('Failed to upload logo.')
    })
  }

  const resetLogo = (e) => {
    e.preventDefault()
    resetLogoForm.post(route('admin.settings.branding.reset'), {
      preserveScroll: true,
      onSuccess: () => toast.success('Branding reset to default logo.')
    })
  }

  const downloadSvg = () => {
    const svgEl = svgRef.current?.querySelector('svg')
    if (!svgEl) return
    const svgString = new XMLSerializer().serializeToString(svgEl)
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    const downloadLink = document.createElement('a')
    downloadLink.href = url
    downloadLink.download = 'lumeniacrm-logo.svg'
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(url)
    toast.success('SVG download started!')
  }

  const downloadPng = () => {
    const svgEl = svgRef.current?.querySelector('svg')
    if (!svgEl) return
    const svgString = new XMLSerializer().serializeToString(svgEl)
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const DOMURL = window.URL || window.webkitURL || window
    const img = new Image()
    const svgUrl = DOMURL.createObjectURL(svgBlob)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, 512, 512)
      const pngUrl = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.href = pngUrl
      downloadLink.download = 'lumeniacrm-logo.png'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      DOMURL.revokeObjectURL(pngUrl)
      DOMURL.revokeObjectURL(svgUrl)
      toast.success('PNG download started!')
    }
    img.src = svgUrl
  }

  // Handlers for AI
  const testAiConnection = async () => {
    if (!aiForm.data.api_key || !aiForm.data.model) {
      toast.error('Please fill in API Key and Model before testing.')
      return
    }
    setTestingAi(true)
    setAiTestResult(null)
    toast.info('Testing AI connection...')
    try {
      const response = await axios.post(route('admin.settings.ai.test'), {
        provider: aiForm.data.provider,
        api_key: aiForm.data.api_key,
        model: aiForm.data.model,
        base_url: aiForm.data.base_url,
      })
      setAiTestResult({ success: true, message: response.data.message })
      toast.success('AI connected successfully!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Connection test failed.'
      setAiTestResult({ success: false, message: msg })
      toast.error('AI connection failed!')
    } finally {
      setTestingAi(false)
    }
  }

  const clearAiConfig = () => {
    if (confirm('Are you sure you want to clear the AI settings?')) {
      aiForm.delete(route('admin.settings.ai.destroy'), {
        onSuccess: () => {
          toast.success('AI Settings cleared.')
          aiForm.setData({
            provider: 'openai',
            api_key: '',
            model: '',
            base_url: '',
            is_active: false,
          })
          setAiTestResult(null)
        }
      })
    }
  }

  const saveAi = (e) => {
    e.preventDefault()
    aiForm.post(route('admin.settings.ai.update'), {
      preserveScroll: true,
      onSuccess: () => toast.success('Admin AI Configuration saved successfully!'),
      onError: () => toast.error('Failed to save configuration.')
    })
  }

  // Handlers for SEO
  const saveSeo = (e) => {
    e.preventDefault()
    seoForm.post(route('admin.settings.seo.update'), {
      preserveScroll: true,
      onSuccess: () => toast.success('SEO & Indexing settings updated successfully!'),
      onError: (err) => {
        const firstErr = Object.values(err)[0]
        toast.error(firstErr || 'Failed to update settings.')
      }
    })
  }

  const sitemapUrl = `${app_url.replace(/\/$/, '')}/sitemap.xml`

  // Sidebar Tabs Config
  const tabsList = [
    { id: 'account', label: 'Account', icon: User, bg: 'bg-violet-50 text-violet-600' },
    { id: 'smtp', label: 'SMTP / Email', icon: Mail, bg: 'bg-blue-50 text-blue-600' },
    { id: 'branding', label: 'Branding & Logo', icon: ImageIcon, bg: 'bg-emerald-50 text-emerald-600' },
    { id: 'ai', label: 'AI Configuration', icon: Cpu, bg: 'bg-purple-50 text-purple-600' },
    { id: 'seo', label: 'SEO & Indexing', icon: Globe, bg: 'bg-indigo-50 text-indigo-600' },
  ]

  // Filter tabs if searching
  const filteredTabs = tabsList.filter(tab => {
    if (!query.trim()) return true
    return getMatchCountForTab(tab.id) > 0
  })

  // Auto switch tab if current active tab has no search matches
  useEffect(() => {
    if (query.trim() && getMatchCountForTab(activeTab) === 0 && filteredTabs.length > 0) {
      setActiveTab(filteredTabs[0].id)
    }
  }, [query, filteredTabs])

  // Custom Form Field Match Visualizer
  const FieldWrapper = ({ id, label, children, colSpan = 'md:col-span-1' }) => {
    const isMatched = isFieldMatched(id)
    return (
      <div className={cn(
        "flex flex-col gap-1 rounded-lg transition-all p-1.5 duration-200", 
        colSpan,
        isMatched && "bg-violet-50/50 border border-violet-150 ring-2 ring-violet-50"
      )}>
        <Label htmlFor={id} className="text-[12px] font-semibold text-slate-600 flex items-center gap-1.5">
          {label}
          {isMatched && (
            <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-violet-100 text-violet-700 text-[9px] font-bold uppercase tracking-wider animate-pulse">
              Match
            </span>
          )}
        </Label>
        {children}
      </div>
    )
  }

  return (
    <>
      <Head title="Admin · Settings Consolidation" />
      <AdminLayout title="Settings">
        <div className="max-w-7xl mx-auto py-5 px-4 w-full">
          
          {/* Top Panel: Header & Search */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
            <div>
              <h1 className="text-[18px] font-bold text-slate-800 leading-tight">Admin System Settings</h1>
              <p className="text-[12px] text-slate-400 font-normal">Manage your site profile, outbound server, assets, and engine optimization in one place.</p>
            </div>

            {/* Global Search Bar */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Type to search settings fields…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 bg-white text-[12.5px] text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
            
            {/* Sidebar Navigation */}
            <div className="flex flex-col gap-1.5 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm lg:col-span-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5 mb-1.5">Settings Panels</p>
              {filteredTabs.length === 0 ? (
                <div className="py-6 text-center text-[12px] text-slate-400 font-medium">
                  No panels match search
                </div>
              ) : (
                filteredTabs.map(tab => {
                  const Icon = tab.icon
                  const matches = getMatchCountForTab(tab.id)
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => changeTab(tab.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-[12.5px] font-semibold rounded-xl transition-all duration-150 text-left",
                        isActive
                          ? "bg-violet-600 text-white shadow-sm shadow-violet-500/10"
                          : "text-slate-600 hover:bg-slate-50 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                          isActive ? "bg-white/20 text-white" : tab.bg
                        )}>
                          <Icon size={13} />
                        </div>
                        <span>{tab.label}</span>
                      </div>
                      
                      {matches > 0 && (
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[10px] font-bold border",
                          isActive 
                            ? "bg-white text-violet-700 border-white/20" 
                            : "bg-violet-100 text-violet-700 border-violet-200"
                        )}>
                          {matches}
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>

            {/* Content Area: Rendering active tab */}
            <div className="lg:col-span-3">
              
              {/* TAB 1: Account Settings */}
              {activeTab === 'account' && (
                <div className="space-y-4">
                  
                  {/* Profile Details Form */}
                  <form onSubmit={saveProfile} className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                      <User size={16} className="text-violet-600" />
                      <h2 className="text-[13.5px] font-bold text-slate-800">Account Credentials</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <FieldWrapper id="profile_name" label="Admin Name" colSpan="md:col-span-2">
                        <Input
                          id="profile_name"
                          value={profileForm.data.name}
                          onChange={e => profileForm.setData('name', e.target.value)}
                          className="h-8 text-[12.5px] rounded-lg mt-0.5"
                        />
                        {profileForm.errors.name && <p className="text-[11px] text-red-500 mt-0.5">{profileForm.errors.name}</p>}
                      </FieldWrapper>

                      <FieldWrapper id="profile_email" label="Email Address" colSpan="md:col-span-2">
                        <Input
                          id="profile_email"
                          type="email"
                          value={profileForm.data.email}
                          onChange={e => profileForm.setData('email', e.target.value)}
                          className="h-8 text-[12.5px] rounded-lg mt-0.5"
                        />
                        {profileForm.errors.email && <p className="text-[11px] text-red-500 mt-0.5">{profileForm.errors.email}</p>}
                      </FieldWrapper>
                    </div>

                    <div className="flex justify-end pt-1">
                      <Button 
                        type="submit" 
                        disabled={profileForm.processing} 
                        size="sm"
                        className="bg-violet-600 hover:bg-violet-700 text-white h-7.5 px-3.5 text-[12px] font-semibold rounded-lg shadow-sm"
                      >
                        {profileForm.processing ? 'Saving Changes…' : 'Save Details'}
                      </Button>
                    </div>
                  </form>

                  {/* Password Form */}
                  <form onSubmit={savePassword} className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                      <Lock size={16} className="text-violet-600" />
                      <h2 className="text-[13.5px] font-bold text-slate-800">Change Password</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <FieldWrapper id="profile_password" label="Current Password" colSpan="md:col-span-2">
                        <Input
                          id="profile_password"
                          type="password"
                          value={passwordForm.data.current_password}
                          onChange={e => passwordForm.setData('current_password', e.target.value)}
                          className="h-8 text-[12.5px] rounded-lg mt-0.5"
                        />
                        {passwordForm.errors.current_password && <p className="text-[11px] text-red-500 mt-0.5">{passwordForm.errors.current_password}</p>}
                      </FieldWrapper>

                      <FieldWrapper id="new_password" label="New Password" colSpan="md:col-span-1">
                        <Input
                          id="new_password"
                          type="password"
                          value={passwordForm.data.password}
                          onChange={e => passwordForm.setData('password', e.target.value)}
                          className="h-8 text-[12.5px] rounded-lg mt-0.5"
                        />
                        {passwordForm.errors.password && <p className="text-[11px] text-red-500 mt-0.5">{passwordForm.errors.password}</p>}
                      </FieldWrapper>

                      <FieldWrapper id="confirm_password" label="Confirm Password" colSpan="md:col-span-1">
                        <Input
                          id="confirm_password"
                          type="password"
                          value={passwordForm.data.password_confirmation}
                          onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                          className="h-8 text-[12.5px] rounded-lg mt-0.5"
                        />
                      </FieldWrapper>
                    </div>

                    <div className="flex justify-end pt-1">
                      <Button 
                        type="submit" 
                        disabled={passwordForm.processing} 
                        size="sm"
                        className="bg-violet-600 hover:bg-violet-700 text-white h-7.5 px-3.5 text-[12px] font-semibold rounded-lg shadow-sm"
                      >
                        {passwordForm.processing ? 'Updating Password…' : 'Update Password'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: SMTP / Email Settings */}
              {activeTab === 'smtp' && (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className={cn(
                    'flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-[12px]',
                    configured
                      ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
                      : 'bg-amber-50/50 border-amber-100 text-amber-800'
                  )}>
                    <div className="flex items-center gap-2">
                      {configured
                        ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        : <AlertCircle size={14} className="text-amber-500 shrink-0" />
                      }
                      <span className="font-semibold">
                        {configured 
                          ? `SMTP Configured (${smtp?.from_email} via ${smtp?.host}:${smtp?.port})` 
                          : 'SMTP is not configured yet. Outbound notifications will fail.'
                        }
                      </span>
                    </div>
                    {configured && (
                      <button
                        type="button"
                        onClick={() => {
                          setTestToEmail('')
                          setShowSmtpTestDialog(true)
                        }}
                        disabled={smtpTestLoading}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors disabled:opacity-50"
                      >
                        {smtpTestLoading ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                        Send Diagnostic Test
                      </button>
                    )}
                  </div>

                  <form onSubmit={saveSmtp} className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Mail size={16} className="text-violet-600" />
                      <h2 className="text-[13.5px] font-bold text-slate-800">Outbound Mail Configuration</h2>
                    </div>

                    {/* Presets Grid */}
                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Zap size={13} className="text-violet-600" />
                        <span className="text-[11.5px] font-bold text-slate-700">Quick Configuration Presets</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                        {SMTP_PRESETS.map(preset => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => applySmtpPreset(preset)}
                            className={cn(
                              'relative flex flex-col items-center gap-1 px-1.5 py-2.5 rounded-lg border transition-all',
                              activeSmtpPreset === preset.id
                                ? 'border-violet-500 bg-violet-50/50 shadow-inner'
                                : 'border-slate-200 bg-white hover:border-violet-300'
                            )}
                          >
                            <div className="w-[14px] h-[14px] flex items-center justify-center mb-0.5">
                              {preset.logo}
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 leading-none">
                              {preset.label}
                            </span>
                          </button>
                        ))}
                      </div>
                      {smtpHint && (
                        <p className="text-[11px] text-blue-700 bg-blue-50/50 p-2 border border-blue-100 rounded-lg mt-2 leading-relaxed">
                          {smtpHint}
                        </p>
                      )}
                    </div>

                    {/* Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FieldWrapper id="smtp_host" label="SMTP Host" colSpan="md:col-span-2">
                        <Input
                          id="smtp_host"
                          value={smtpForm.data.host}
                          onChange={e => smtpForm.setData('host', e.target.value)}
                          placeholder="smtp.mailgun.org"
                          className="h-8 text-[12.5px] rounded-lg mt-0.5 font-mono"
                        />
                        {smtpForm.errors.host && <p className="text-[11px] text-red-500 mt-0.5">{smtpForm.errors.host}</p>}
                      </FieldWrapper>

                      <FieldWrapper id="smtp_port" label="Port" colSpan="md:col-span-1">
                        <Input
                          id="smtp_port"
                          type="number"
                          value={smtpForm.data.port}
                          onChange={e => smtpForm.setData('port', parseInt(e.target.value) || 587)}
                          placeholder="587"
                          className="h-8 text-[12.5px] rounded-lg mt-0.5 font-mono"
                        />
                        {smtpForm.errors.port && <p className="text-[11px] text-red-500 mt-0.5">{smtpForm.errors.port}</p>}
                      </FieldWrapper>

                      <FieldWrapper id="smtp_encryption" label="Encryption" colSpan="md:col-span-1">
                        <Select 
                          value={smtpForm.data.encryption} 
                          onValueChange={v => smtpForm.setData('encryption', v)}
                        >
                          <SelectTrigger id="smtp_encryption" className="h-8 text-[12.5px] rounded-lg mt-0.5 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tls">TLS (STARTTLS)</SelectItem>
                            <SelectItem value="ssl">SSL (465)</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </FieldWrapper>

                      <FieldWrapper id="smtp_username" label="SMTP Username" colSpan="md:col-span-2">
                        <Input
                          id="smtp_username"
                          value={smtpForm.data.username}
                          onChange={e => smtpForm.setData('username', e.target.value)}
                          className="h-8 text-[12.5px] rounded-lg mt-0.5"
                          autoComplete="off"
                        />
                        {smtpForm.errors.username && <p className="text-[11px] text-red-500 mt-0.5">{smtpForm.errors.username}</p>}
                      </FieldWrapper>

                      <FieldWrapper id="smtp_password" label="SMTP Password" colSpan="md:col-span-2">
                        <div className="relative mt-0.5">
                          <Input
                            id="smtp_password"
                            type={showPassword ? 'text' : 'password'}
                            value={smtpForm.data.password}
                            onChange={e => smtpForm.setData('password', e.target.value)}
                            placeholder={smtp?.username ? '•••••••• (unchanged)' : 'Enter SMTP password'}
                            className="h-8 text-[12.5px] rounded-lg pr-9"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                        {smtpForm.errors.password && <p className="text-[11px] text-red-500 mt-0.5">{smtpForm.errors.password}</p>}
                      </FieldWrapper>

                      <FieldWrapper id="smtp_from_name" label="From Display Name" colSpan="md:col-span-2">
                        <Input
                          id="smtp_from_name"
                          value={smtpForm.data.from_name}
                          onChange={e => smtpForm.setData('from_name', e.target.value)}
                          className="h-8 text-[12.5px] rounded-lg mt-0.5"
                        />
                        {smtpForm.errors.from_name && <p className="text-[11px] text-red-500 mt-0.5">{smtpForm.errors.from_name}</p>}
                      </FieldWrapper>

                      <FieldWrapper id="smtp_from_email" label="From Email Address" colSpan="md:col-span-2">
                        <Input
                          id="smtp_from_email"
                          type="email"
                          value={smtpForm.data.from_email}
                          onChange={e => smtpForm.setData('from_email', e.target.value)}
                          className="h-8 text-[12.5px] rounded-lg mt-0.5 font-mono"
                        />
                        {smtpForm.errors.from_email && <p className="text-[11px] text-red-500 mt-0.5">{smtpForm.errors.from_email}</p>}
                      </FieldWrapper>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-100">
                      <Button
                        type="submit"
                        disabled={smtpForm.processing}
                        size="sm"
                        className="bg-violet-600 hover:bg-violet-700 text-white h-7.5 px-3.5 text-[12px] font-semibold rounded-lg shadow-sm"
                      >
                        {smtpForm.processing ? 'Saving Outbound Settings…' : 'Save Connection'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: Branding & Logo Settings */}
              {activeTab === 'branding' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  {/* Logo Upload Card */}
                  <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
                        <ImageIcon size={16} className="text-violet-600" />
                        <h2 className="text-[13.5px] font-bold text-slate-800">System Brand Mark</h2>
                      </div>
                      <p className="text-[11.5px] text-slate-400 mb-3 leading-relaxed">
                        Customize your workspace layout branding by uploading a PNG, JPG, or SVG mark. Max 2MB file size.
                      </p>

                      <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-150 mb-3">
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Logo Preview</span>
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-inner">
                            {custom_logo_url ? (
                              <img src={custom_logo_url} className="object-contain max-w-full max-h-full" alt="System Logo" />
                            ) : (
                              <LogoMark size={24} />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-slate-700 truncate">
                            {custom_logo_url ? 'Custom Brand Logo Active' : 'Default Platform Branding'}
                          </p>
                          <p className="text-[10.5px] text-slate-400 mt-0.5">PNG, JPG, or SVG. Suggested size 120x120px.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 py-1.5 rounded-lg border border-slate-200 hover:border-slate-350 text-[11.5px] font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Upload size={12} />
                          Browse File
                        </button>
                        {custom_logo_url && (
                          <button
                            type="button"
                            onClick={resetLogo}
                            disabled={resetLogoForm.processing}
                            className="px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-[11.5px] font-semibold text-red-600 transition-colors disabled:opacity-50"
                          >
                            Reset Defaults
                          </button>
                        )}
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {uploadLogoForm.data.logo && (
                        <form onSubmit={uploadLogo} className="flex items-center justify-between p-2 rounded-lg border border-violet-100 bg-violet-50/50 mt-2 animate-fadeIn">
                          <span className="text-[11.5px] text-violet-700 font-semibold truncate max-w-[60%]">
                            Selected: {uploadLogoForm.data.logo.name}
                          </span>
                          <button
                            type="submit"
                            disabled={uploadLogoForm.processing}
                            className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold shadow-sm"
                          >
                            {uploadLogoForm.processing ? 'Uploading…' : 'Upload logo'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* Brand Assets Download Card */}
                  <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
                        <Download size={16} className="text-violet-600" />
                        <h2 className="text-[13.5px] font-bold text-slate-800">Media Branding Resources</h2>
                      </div>
                      <p className="text-[11.5px] text-slate-400 mb-3 leading-relaxed">
                        Download high-definition SVG layout configurations or 512px transparent PNG files of the default mark for system documentation.
                      </p>

                      <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-150 mb-3">
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Default Core</span>
                          <div ref={svgRef} className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-sm">
                            <LogoMark size={28} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-[12px] font-semibold text-slate-700">Official Brand Assets</p>
                          <p className="text-[10.5px] text-slate-405 mt-0.5">Vector (SVG) scalable, or pre-rendered raster PNG mark.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={downloadSvg}
                        className="flex-1 py-1.5 rounded-lg border border-slate-250 bg-white hover:bg-slate-50 text-[11.5px] font-bold text-slate-700 flex items-center justify-center gap-1 shadow-sm transition-colors"
                      >
                        <Download size={12} className="text-slate-400" />
                        Download SVG
                      </button>
                      <button
                        type="button"
                        onClick={downloadPng}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11.5px] font-bold flex items-center justify-center gap-1 shadow-sm transition-colors"
                      >
                        <Download size={12} />
                        Download PNG
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AI Settings */}
              {activeTab === 'ai' && (
                <div className="space-y-4">
                  
                  {/* AI Service Form */}
                  <form onSubmit={saveAi} className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Cpu size={16} className="text-violet-600" />
                        <h2 className="text-[13.5px] font-bold text-slate-800">Global AI Model Configuration</h2>
                      </div>
                      <button
                        type="button"
                        onClick={clearAiConfig}
                        className="text-[11.5px] font-bold text-red-650 hover:underline flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Clear Config
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Provider Grid Selector */}
                      <FieldWrapper id="ai_provider" label="Select Provider" colSpan="md:col-span-2">
                        <div className="grid grid-cols-3 gap-2 mt-0.5">
                          {[
                            { id: 'openai', label: 'OpenAI' },
                            { id: 'claude', label: 'Anthropic' },
                            { id: 'kimi', label: 'Kimi (NIM)' },
                          ].map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => aiForm.setData('provider', p.id)}
                              className={cn(
                                'py-1 rounded-lg border font-bold text-[11.5px] transition-all text-center',
                                aiForm.data.provider === p.id
                                  ? 'border-violet-650 bg-violet-50 text-violet-750'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-350'
                              )}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </FieldWrapper>

                      {/* API Key */}
                      <FieldWrapper id="ai_api_key" label="API Key Credentials" colSpan="md:col-span-2">
                        <div className="relative mt-0.5">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <Key size={12} />
                          </span>
                          <input
                            id="ai_api_key"
                            type={showApiKey ? 'text' : 'password'}
                            value={aiForm.data.api_key}
                            onChange={e => aiForm.setData('api_key', e.target.value)}
                            placeholder="sk-..."
                            className="w-full h-8 pl-8 pr-8 text-[12.5px] rounded-lg border border-slate-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showApiKey ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                        {aiForm.errors.api_key && <p className="text-red-500 text-[11px] mt-0.5">{aiForm.errors.api_key}</p>}
                      </FieldWrapper>

                      {/* AI Model select */}
                      <FieldWrapper id="ai_model" label="AI Model Select" colSpan="md:col-span-2">
                        <Select
                          value={aiForm.data.model}
                          onValueChange={v => aiForm.setData('model', v)}
                        >
                          <SelectTrigger id="ai_model" className="h-8 text-[12.5px] mt-0.5 bg-white">
                            <SelectValue placeholder="Select model..." />
                          </SelectTrigger>
                          <SelectContent>
                            {(models[aiForm.data.provider] || []).map(m => (
                              <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                            ))}
                            <SelectItem value="custom">-- Custom Name --</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {aiForm.data.model === 'custom' && (
                          <input
                            type="text"
                            onChange={e => aiForm.setData('model', e.target.value)}
                            placeholder="e.g. gpt-4-32k"
                            className="w-full h-8 px-2.5 mt-2 text-[12.5px] rounded-lg border border-slate-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all outline-none"
                          />
                        )}
                        {aiForm.errors.model && <p className="text-red-500 text-[11px] mt-0.5">{aiForm.errors.model}</p>}
                      </FieldWrapper>

                      {/* Custom Base URL */}
                      <FieldWrapper id="ai_base_url" label="API Endpoint Override (Optional)" colSpan="md:col-span-2">
                        <Input
                          id="ai_base_url"
                          type="url"
                          value={aiForm.data.base_url}
                          onChange={e => aiForm.setData('base_url', e.target.value)}
                          placeholder="e.g. https://api.openai.com/v1"
                          className="h-8 text-[12.5px] rounded-lg mt-0.5"
                        />
                        {aiForm.errors.base_url && <p className="text-red-500 text-[11px] mt-0.5">{aiForm.errors.base_url}</p>}
                      </FieldWrapper>
                    </div>

                    {/* Activation & Diagnostic validation */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3.5 bg-slate-50 border border-slate-150 rounded-xl items-center">
                      <div className="md:col-span-2 flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg">
                        <div>
                          <span className="block text-[12px] font-bold text-slate-700">Service Active Status</span>
                          <span className="block text-[10px] text-slate-405 mt-0.5">Toggle global auto-writing.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={aiForm.data.is_active}
                          onChange={e => aiForm.setData('is_active', e.target.checked)}
                          className="w-4 h-4 accent-violet-600 cursor-pointer"
                        />
                      </div>

                      <div className="md:col-span-2 flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg">
                        <div>
                          <span className="block text-[12px] font-bold text-slate-700">Diagnostic Verification</span>
                          <span className="block text-[10px] text-slate-405 mt-0.5">
                            {setting?.validated_at ? `Verified: ${new Date(setting.validated_at).toLocaleDateString()}` : 'Connection not validated.'}
                          </span>
                        </div>
                        {setting?.validated_at ? (
                          <span className="px-2 py-0.5 text-[9.5px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[9.5px] font-bold rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Diagnostics Result Card */}
                    <div className="p-3 border border-slate-150 bg-slate-50 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11.5px] font-bold text-slate-700">API Connection Testing</span>
                        <button
                          type="button"
                          onClick={testAiConnection}
                          disabled={testingAi}
                          className="px-3 py-1 rounded-lg border border-slate-350 text-[11px] font-bold bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          {testingAi ? <RefreshCw size={11} className="animate-spin" /> : <Send size={11} />}
                          Run AI Diagnostic
                        </button>
                      </div>

                      {aiTestResult && (
                        <div className={cn(
                          "p-2.5 rounded-lg border text-[11px] leading-relaxed",
                          aiTestResult.success
                            ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
                            : 'bg-red-50/50 border-red-100 text-red-800'
                        )}>
                          <h4 className="font-bold flex items-center gap-1 mb-0.5">
                            {aiTestResult.success ? (
                              <CheckCircle2 size={12} className="text-emerald-500" />
                            ) : (
                              <AlertCircle size={12} className="text-red-500" />
                            )}
                            {aiTestResult.success ? 'Diagnostic Connected Successfully' : 'Diagnostic Error Failure'}
                          </h4>
                          <p className="mt-0.5">{aiTestResult.message}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-100">
                      <Button
                        type="submit"
                        disabled={aiForm.processing}
                        size="sm"
                        className="bg-violet-600 hover:bg-violet-700 text-white h-7.5 px-3.5 text-[12px] font-semibold rounded-lg shadow-sm"
                      >
                        {aiForm.processing ? 'Saving AI Config…' : 'Save AI Settings'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 5: SEO Settings */}
              {activeTab === 'seo' && (
                <div className="space-y-4">
                  
                  {/* SEO Details Form */}
                  <form onSubmit={saveSeo} className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Globe size={16} className="text-violet-600" />
                      <h2 className="text-[13.5px] font-bold text-slate-800">Search Engine Indexing Optimizations</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Meta Title */}
                      <FieldWrapper id="seo_title" label="Global Meta Title" colSpan="md:col-span-2">
                        <Input
                          id="seo_title"
                          value={seoForm.data.meta_title}
                          onChange={e => seoForm.setData('meta_title', e.target.value)}
                          placeholder="LumeniaCRM - Lead Management Engine"
                          className="h-8 text-[12.5px] rounded-lg mt-0.5"
                        />
                        {seoForm.errors.meta_title && <p className="text-red-500 text-[11px] mt-0.5">{seoForm.errors.meta_title}</p>}
                      </FieldWrapper>

                      {/* Meta Keywords */}
                      <FieldWrapper id="seo_keywords" label="Fallback keywords (Comma Separated)" colSpan="md:col-span-2">
                        <Input
                          id="seo_keywords"
                          value={seoForm.data.meta_keywords}
                          onChange={e => seoForm.setData('meta_keywords', e.target.value)}
                          placeholder="crm, outbound, metrics"
                          className="h-8 text-[12.5px] rounded-lg mt-0.5"
                        />
                        {seoForm.errors.meta_keywords && <p className="text-red-500 text-[11px] mt-0.5">{seoForm.errors.meta_keywords}</p>}
                      </FieldWrapper>

                      {/* Meta Description */}
                      <FieldWrapper id="seo_description" label="Global Fallback Description" colSpan="md:col-span-4">
                        <textarea
                          id="seo_description"
                          value={seoForm.data.meta_description}
                          onChange={e => seoForm.setData('meta_description', e.target.value)}
                          placeholder="Describe your layout platform details in under 160 characters..."
                          rows="2"
                          className="w-full p-2 text-[12.5px] rounded-lg border border-slate-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all outline-none text-slate-650 resize-none leading-normal mt-0.5"
                        />
                        {seoForm.errors.meta_description && <p className="text-red-500 text-[11px] mt-0.5">{seoForm.errors.meta_description}</p>}
                      </FieldWrapper>

                      {/* Robots.txt Configuration */}
                      <FieldWrapper id="seo_robots" label="robots.txt Rule Editor" colSpan="md:col-span-3">
                        <textarea
                          id="seo_robots"
                          value={seoForm.data.robots_txt}
                          onChange={e => seoForm.setData('robots_txt', e.target.value)}
                          rows="4"
                          className="w-full p-2 font-mono text-[11.5px] rounded-lg border border-slate-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all outline-none bg-slate-50 text-slate-700 leading-normal mt-0.5"
                        />
                        <div className="mt-1 p-2 bg-slate-50 border border-slate-150 rounded-lg text-[10.5px] text-slate-405 space-y-0.5">
                          <p>• <span className="font-mono bg-white px-1 py-0.2 rounded border border-slate-200">User-agent: *</span> controls all search crawlers.</p>
                          <p>• Include <span className="font-mono bg-white px-1 py-0.2 rounded border border-slate-200">Sitemap: {sitemapUrl}</span> dynamically.</p>
                        </div>
                        {seoForm.errors.robots_txt && <p className="text-red-500 text-[11px] mt-0.5">{seoForm.errors.robots_txt}</p>}
                      </FieldWrapper>

                      {/* Sitemap Status Box */}
                      <div className="md:col-span-1 p-3 bg-slate-50 border border-slate-150 rounded-xl flex flex-col justify-between mt-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <FileText size={13} className="text-emerald-500" />
                          <span className="text-[11.5px] font-bold text-slate-755">Sitemap Integration</span>
                        </div>
                        <p className="text-[10.5px] text-slate-405 leading-relaxed mb-3">
                          Dynamically built and cached based on layout urls and public blogs.
                        </p>
                        
                        <div className="p-2 bg-white border border-emerald-100 rounded-lg flex items-center justify-between">
                          <a
                            href="/sitemap.xml"
                            target="_blank"
                            className="text-[10.5px] text-violet-650 hover:underline font-bold truncate max-w-[70%]"
                          >
                            sitemap.xml
                          </a>
                          <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Live
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-100">
                      <Button
                        type="submit"
                        disabled={seoForm.processing}
                        size="sm"
                        className="bg-violet-600 hover:bg-violet-700 text-white h-7.5 px-3.5 text-[12px] font-semibold rounded-lg shadow-sm"
                      >
                        {seoForm.processing ? 'Saving SEO Config…' : 'Save SEO Options'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>

      {/* SMTP Test Dialog Modal */}
      <Dialog open={showSmtpTestDialog} onOpenChange={setShowSmtpTestDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[14px] font-bold text-slate-800">Send Outbound Diagnostic Email</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-1.5">
            <Label className="text-[11.5px] font-bold text-slate-655">
              Recipient Email Address <span className="text-red-400 font-normal">*</span>
            </Label>
            <Input
              type="email"
              placeholder="recipient@example.com"
              value={testToEmail}
              onChange={e => setTestToEmail(e.target.value)}
              className="h-8.5 text-[12.5px] rounded-lg mt-0.5"
              autoFocus
            />
            <p className="text-[10.5px] text-slate-400 leading-snug">
              A standard diagnostic test message will be sent to verify outgoing configuration connections.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setShowSmtpTestDialog(false)}
              className="h-7.5 px-3 text-[11.5px] font-semibold text-slate-650 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={sendSmtpTest}
              disabled={!testToEmail || smtpTestLoading}
              className="flex items-center gap-1.5 h-7.5 px-3.5 text-[11.5px] font-bold text-white rounded-lg transition-all hover:opacity-90 bg-violet-600 disabled:opacity-40"
            >
              {smtpTestLoading ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
              Send Test
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
