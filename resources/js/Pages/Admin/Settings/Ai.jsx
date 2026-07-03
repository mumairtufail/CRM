import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import { ArrowLeft, Cpu, Key, RefreshCw, Send, Sparkles, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Ai({ setting, models }) {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [showApiKey, setShowApiKey] = useState(false)

  const defaultSetting = setting || {
    provider: 'openai',
    api_key: '',
    model: '',
    base_url: '',
    is_active: false,
    validated_at: null,
  }

  const { data, setData, post, processing, errors, delete: destroy } = useForm({
    provider: defaultSetting.provider,
    api_key: defaultSetting.api_key || '',
    model: defaultSetting.model || '',
    base_url: defaultSetting.base_url || '',
    is_active: !!defaultSetting.is_active,
  })

  // Auto-select first model of provider when provider changes, if model is not set
  useEffect(() => {
    const providerModels = models[data.provider] || []
    if (providerModels.length > 0 && !providerModels.some(m => m.id === data.model)) {
      setData('model', providerModels[0].id)
    }
  }, [data.provider])

  const submit = (e) => {
    e.preventDefault()
    post('/admin/settings/ai', {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Admin AI Configuration saved successfully!')
      },
      onError: () => {
        toast.error('Failed to save configuration.')
      }
    })
  }

  const testConnection = async () => {
    if (!data.api_key || !data.model) {
      toast.error('Please fill in API Key and Model before testing.')
      return
    }

    setTesting(true)
    setTestResult(null)
    toast.info('Testing AI connection...')

    try {
      const response = await axios.post('/admin/settings/ai/test', {
        provider: data.provider,
        api_key: data.api_key,
        model: data.model,
        base_url: data.base_url,
      })

      setTestResult({
        success: true,
        message: response.data.message,
      })
      toast.success('AI connected successfully!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Connection test failed.'
      setTestResult({
        success: false,
        message: msg,
      })
      toast.error('AI connection failed!')
    } finally {
      setTesting(false)
    }
  }

  const clearConfig = () => {
    if (confirm('Are you sure you want to clear the AI settings?')) {
      destroy('/admin/settings/ai', {
        onSuccess: () => {
          toast.success('AI Settings cleared.')
          setData({
            provider: 'openai',
            api_key: '',
            model: '',
            base_url: '',
            is_active: false,
          })
          setTestResult(null)
        }
      })
    }
  }

  const currentModels = models[data.provider] || []

  return (
    <>
      <Head title="Admin · AI Configuration" />
      <AdminLayout title="AI Configuration">
        <div className="max-w-2xl mx-auto py-6 px-2">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[13px] text-slate-400 mb-6">
            <Link href="/admin/settings" className="hover:text-violet-600 transition-colors">Settings</Link>
            <span>/</span>
            <span className="text-slate-600 font-medium">AI Configuration</span>
          </div>

          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-[20px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                <Cpu size={22} className="text-violet-600" />
                AI Configuration
              </h1>
              <p className="text-[13px] text-slate-400 font-normal leading-relaxed">
                Configure the global AI provider used for platform tasks, template writing, and auto-analysis.
              </p>
            </div>
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12.5px] font-semibold text-slate-600 transition-colors"
            >
              <ArrowLeft size={13} /> Back
            </Link>
          </div>

          {/* Form and Status Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-[14.5px] font-bold text-slate-800">Connection Settings</h2>
                <p className="text-[12px] text-slate-400">Configure provider keys and endpoints.</p>
              </div>
              <div className="flex items-center gap-2">
                {defaultSetting.validated_at ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Sparkles size={11} /> Validated
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-500 border border-slate-150">
                    Not Tested
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={submit} className="space-y-5">
              {/* Provider Select */}
              <div>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                  AI Provider
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'openai', label: 'OpenAI' },
                    { id: 'claude', label: 'Anthropic' },
                    { id: 'kimi', label: 'Kimi (NVIDIA NIM)' },
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setData('provider', p.id)}
                      className={`py-3 px-4 rounded-xl border text-center font-bold text-[13px] transition-all flex flex-col items-center justify-center gap-1 ${
                        data.provider === p.id
                          ? 'border-violet-600 bg-violet-50/50 text-violet-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                  API Key
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400">
                    <Key size={15} />
                  </span>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={data.api_key}
                    onChange={e => setData('api_key', e.target.value)}
                    placeholder="sk-..."
                    className="w-full h-10 pl-10 pr-10 text-[13.5px] rounded-lg border border-slate-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.api_key && <p className="text-red-500 text-[11.5px] mt-1">{errors.api_key}</p>}
              </div>

              {/* Model Select */}
              <div>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                  AI Model
                </label>
                <select
                  value={data.model}
                  onChange={e => setData('model', e.target.value)}
                  className="w-full h-10 px-3 text-[13.5px] rounded-lg border border-slate-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all outline-none bg-white"
                >
                  <option value="">Select a model...</option>
                  {currentModels.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                  <option value="custom">-- Custom Model Name --</option>
                </select>
                
                {data.model === 'custom' && (
                  <input
                    type="text"
                    value={data.model === 'custom' ? '' : data.model}
                    onChange={e => setData('model', e.target.value)}
                    placeholder="Enter custom model identifier (e.g. gpt-4-32k)"
                    className="w-full h-10 px-3 mt-2 text-[13.5px] rounded-lg border border-slate-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all outline-none"
                  />
                )}
                {errors.model && <p className="text-red-500 text-[11.5px] mt-1">{errors.model}</p>}
              </div>

              {/* Base URL (Optional) */}
              <div>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  Base Endpoint URL <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={data.base_url}
                  onChange={e => setData('base_url', e.target.value)}
                  placeholder="e.g. https://api.openai.com/v1"
                  className="w-full h-10 px-3 text-[13.5px] rounded-lg border border-slate-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave empty to use the provider's default URL. Change this when proxying or using local hosts.
                </p>
                {errors.base_url && <p className="text-red-500 text-[11.5px] mt-1">{errors.base_url}</p>}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div>
                  <span className="block text-[13px] font-semibold text-slate-700">Enable Provider</span>
                  <span className="block text-[11.5px] text-slate-400">Activate or suspend this AI client globally.</span>
                </div>
                <input
                  type="checkbox"
                  checked={data.is_active}
                  onChange={e => setData('is_active', e.target.checked)}
                  className="w-5 h-5 accent-violet-600 rounded cursor-pointer"
                />
              </div>

              {/* Connection Test Results */}
              {testResult && (
                <div className={`p-4 rounded-xl border text-[13px] leading-relaxed ${
                  testResult.success 
                    ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
                    : 'bg-red-50/50 border-red-100 text-red-800'
                }`}>
                  <h4 className="font-bold mb-1 flex items-center gap-1.5">
                    {testResult.success ? 'Success' : 'Connection Failed'}
                  </h4>
                  <p>{testResult.message}</p>
                  {testResult.success && defaultSetting.validated_at && (
                    <p className="text-[11px] text-emerald-600 mt-2">
                      Validated at: {new Date(defaultSetting.validated_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={clearConfig}
                  className="px-3.5 py-2 rounded-lg border border-red-200 text-[12.5px] font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 size={14} /> Clear Settings
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={testConnection}
                    disabled={testing}
                    className="px-3.5 py-2 rounded-lg border border-slate-200 text-[12.5px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {testing ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                    Test Connection
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-violet-600 text-[12.5px] font-semibold text-white hover:bg-violet-700 flex items-center gap-1.5 transition-colors shadow-sm shadow-violet-500/10 disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}
