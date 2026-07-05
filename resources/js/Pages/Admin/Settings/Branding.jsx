import { Head, Link, useForm, usePage } from '@inertiajs/react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import { ArrowLeft, Upload, RefreshCw, Download, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { LogoMark } from '@/Components/Common/Logo'
import { useRef } from 'react'

export default function Branding({ custom_logo_url }) {
  const fileInputRef = useRef(null)
  const svgRef = useRef(null)

  const uploadForm = useForm({
    logo: null,
  })

  const resetForm = useForm()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB.')
      return
    }

    uploadForm.setData('logo', file)
  }

  const handleUploadSubmit = (e) => {
    e.preventDefault()
    if (!uploadForm.data.logo) return

    uploadForm.post('/admin/settings/branding', {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Branding logo uploaded successfully!')
        uploadForm.reset()
      },
      onError: () => {
        toast.error('Failed to upload logo. Please check file type.')
      }
    })
  }

  const handleReset = (e) => {
    e.preventDefault()
    resetForm.post('/admin/settings/branding/reset', {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Branding reset to default logo.')
      }
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

  return (
    <>
      <Head title="Admin · Branding & Logo" />
      <AdminLayout title="Branding & Logo">
        <div className="max-w-7xl mx-auto py-6 px-4 w-full">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[12px] text-slate-400 mb-3">
            <Link href="/admin/settings" className="hover:text-brand-600 transition-colors">Settings</Link>
            <span>/</span>
            <span className="text-slate-600 font-medium">Branding & Logo</span>
          </div>

          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="text-[17px] font-bold text-slate-800 mb-0.5">Branding & Logo</h1>
              <p className="text-[12px] text-slate-400 font-normal leading-snug">
                Manage your system custom logo and download official branding assets.
              </p>
            </div>
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-semibold text-slate-600 transition-colors shrink-0"
            >
              <ArrowLeft size={12} /> Back
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 1: Custom Logo Upload */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h2 className="text-[13.5px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                <ImageIcon size={15} className="text-brand-500" />
                System Custom Logo
              </h2>
              <p className="text-[11.5px] text-slate-400 mb-3 leading-snug">
                Upload a custom logo to replace the default SVG mark across all tenant workspaces, login screens, and headers.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-3">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Logo</span>
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-inner">
                    {custom_logo_url ? (
                      <img src={custom_logo_url} className="object-contain max-w-full max-h-full" alt="Custom Logo" />
                    ) : (
                      <LogoMark size={30} />
                    )}
                  </div>
                </div>

                <div className="flex-1 w-full text-center sm:text-left">
                  <p className="text-[12.5px] font-medium text-slate-700">
                    {custom_logo_url ? 'Using Custom branding logo' : 'Using Default SVG logo'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    PNG, JPG, or SVG. Recommended 120x120px, max 2MB.
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-semibold text-slate-600 flex items-center gap-1.5 transition-colors"
                    >
                      <Upload size={12} /> Select Logo
                    </button>
                    {custom_logo_url && (
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={resetForm.processing}
                        className="px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-[12px] font-semibold text-red-600 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={12} /> Reset Default
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
                </div>
              </div>

              {uploadForm.data.logo && (
                <form onSubmit={handleUploadSubmit} className="flex items-center justify-between p-2.5 rounded-lg border border-brand-100 bg-brand-50/50">
                  <span className="text-[12px] text-brand-700 truncate max-w-[65%] font-medium">
                    Selected: {uploadForm.data.logo.name}
                  </span>
                  <button
                    type="submit"
                    disabled={uploadForm.processing}
                    className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-[12px] font-semibold flex items-center gap-1 transition-all disabled:opacity-50 shadow-sm shadow-brand-500/10"
                  >
                    {uploadForm.processing ? 'Uploading…' : 'Upload Logo'}
                  </button>
                </form>
              )}
            </div>

            {/* Card 2: Branding Asset Downloads */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h2 className="text-[13.5px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                <Download size={15} className="text-emerald-500" />
                Branding Assets Download
              </h2>
              <p className="text-[11.5px] text-slate-400 mb-3 leading-snug">
                Download the default high-fidelity SVG icon or pre-rendered 512x512px PNG logo mark for print, marketing, or general web use.
              </p>

              <div className="flex flex-col md:flex-row items-center gap-4 p-3 border border-slate-100 bg-slate-50 rounded-xl">
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Default SVG Mark</span>
                  <div ref={svgRef} className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-3 shadow-sm">
                    {/* Render our default SVG */}
                    <LogoMark size={36} />
                  </div>
                </div>

                <div className="flex-1 w-full text-center md:text-left flex flex-col justify-between">
                  <div>
                    <h3 className="text-[12.5px] font-bold text-slate-700">Official Logo Mark Assets</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Vector (SVG) for infinite scaling, or high-res raster (PNG) at 512x512px with transparency.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-3">
                    <button
                      type="button"
                      onClick={downloadSvg}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[12px] font-semibold text-slate-600 flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Download size={12} className="text-slate-400" />
                      SVG
                    </button>
                    <button
                      type="button"
                      onClick={downloadPng}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Download size={12} />
                      PNG (512x512)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}
