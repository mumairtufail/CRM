import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import { ArrowLeft, BookOpen, FileText, Image as ImageIcon, Save, Tag as TagIcon, X, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useState, useRef } from 'react'
import RichEditor from '@/Components/Common/RichEditor'
import axios from 'axios'

export default function Form({ blog }) {
  const fileInputRef = useRef(null)
  const [imagePreview, setImagePreview] = useState(blog?.image_url || null)
  const [tagInput, setTagInput] = useState('')
  const [suggesting, setSuggesting] = useState(false)

  const isEdit = !!blog

  const { data, setData, post, processing, errors } = useForm({
    title: blog?.title || '',
    subtitle: blog?.subtitle || '',
    description: blog?.description || '',
    body: blog?.body || '',
    tags: blog?.tags || [],
    image: null,
    image_url_link: blog?.image_path && blog.image_path.startsWith('http') ? blog.image_path : '',
    image_cleared: false,
    is_published: !!blog?.is_published,
  })

  const suggestSeo = async () => {
    if (!data.title) {
      toast.error('Please enter a post title first.')
      return
    }
    if (!data.body) {
      toast.error('Please write some content in the body first.')
      return
    }

    setSuggesting(true)
    toast.info('AI is generating SEO optimization suggestions...')

    try {
      const response = await axios.post('/admin/blogs/generate-seo', {
        title: data.title,
        body: data.body,
      })

      const seoData = response.data
      
      // Update form fields
      setData(prev => ({
        ...prev,
        title: seoData.title || prev.title,
        description: seoData.description || prev.description,
        tags: seoData.tags && Array.isArray(seoData.tags) ? seoData.tags : prev.tags,
      }))
      
      toast.success('SEO Suggestions applied!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate SEO suggestion.'
      toast.error(msg)
    } finally {
      setSuggesting(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 3 * 1024 * 1024) {
      toast.error('File size must be less than 3MB.')
      return
    }

    setData(prev => ({
      ...prev,
      image: file,
      image_cleared: false,
    }))
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setData(prev => ({
      ...prev,
      image: null,
      image_url_link: '',
      image_cleared: true,
    }))
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = tagInput.trim().toLowerCase()
      if (val && !data.tags.includes(val)) {
        setData('tags', [...data.tags, val])
        setTagInput('')
      }
    }
  }

  const removeTag = (indexToRemove) => {
    setData('tags', data.tags.filter((_, i) => i !== indexToRemove))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!data.title) {
      toast.error('Please enter a post title.')
      return
    }
    if (!data.body) {
      toast.error('Please write some content in the body.')
      return
    }

    const url = isEdit ? `/admin/blogs/${blog.id}` : '/admin/blogs'

    post(url, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(isEdit ? 'Blog post updated!' : 'Blog post created successfully!')
      },
      onError: (err) => {
        const firstErr = Object.values(err)[0]
        toast.error(firstErr || 'Failed to save post.')
      }
    })
  }

  return (
    <>
      <Head title={isEdit ? `Admin · Edit "${data.title}"` : 'Admin · Write Post'} />
      <AdminLayout title={isEdit ? 'Edit Post' : 'Write Post'}>
        <div className="py-6 px-4 max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[13px] text-slate-400 mb-6">
            <Link href="/admin/blogs" className="hover:text-violet-600 transition-colors">Blogs</Link>
            <span>/</span>
            <span className="text-slate-600 font-medium">{isEdit ? 'Edit Post' : 'Write New Post'}</span>
          </div>

          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-[20px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                <FileText size={22} className="text-violet-600" />
                {isEdit ? 'Edit Blog Post' : 'Compose Blog Post'}
              </h1>
              <p className="text-[13px] text-slate-400 font-normal leading-relaxed">
                Publish rich content, images, and optimized SEO metadata for your audience.
              </p>
            </div>
            <Link
              href="/admin/blogs"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12.5px] font-semibold text-slate-600 transition-colors"
            >
              <ArrowLeft size={13} /> Back to Blogs
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Main Editor Fields (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                    Post Title
                  </label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={e => setData('title', e.target.value)}
                    placeholder="Enter an attention-grabbing title..."
                    className="w-full h-10 px-3.5 text-[13.5px] rounded-lg border border-slate-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all outline-none font-semibold text-slate-800"
                  />
                  {errors.title && <p className="text-red-500 text-[11.5px] mt-1">{errors.title}</p>}
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                    Subtitle / Summary
                  </label>
                  <input
                    type="text"
                    value={data.subtitle}
                    onChange={e => setData('subtitle', e.target.value)}
                    placeholder="A brief subtitle explaining the post..."
                    className="w-full h-10 px-3.5 text-[13px] rounded-lg border border-slate-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all outline-none text-slate-600"
                  />
                  {errors.subtitle && <p className="text-red-500 text-[11.5px] mt-1">{errors.subtitle}</p>}
                </div>

                {/* Content Body Editor */}
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                    Body Content
                  </label>
                  <div className="border border-slate-200 rounded-lg overflow-hidden min-h-[300px]">
                    <RichEditor
                      value={data.body}
                      onChange={val => setData('body', val)}
                    />
                  </div>
                  {errors.body && <p className="text-red-500 text-[11.5px] mt-1">{errors.body}</p>}
                </div>
              </div>
            </div>

            {/* Right Col: Settings, SEO, Thumbnail (1/3 width) */}
            <div className="space-y-6">
              {/* Publishing Options Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-[13.5px] font-bold text-slate-800 pb-2 border-b border-slate-100">
                  Publishing
                </h3>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <span className="block text-[12.5px] font-semibold text-slate-700">Publish Immediately</span>
                    <span className="block text-[11px] text-slate-400">Make this post live on the blog.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={data.is_published}
                    onChange={e => setData('is_published', e.target.checked)}
                    className="w-4.5 h-4.5 accent-violet-600 rounded cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-[13px] font-bold text-white flex items-center justify-center gap-1.5 shadow-sm shadow-violet-500/10 transition-all disabled:opacity-50"
                >
                  <Save size={14} /> Save Post
                </button>
              </div>

              {/* Thumbnail Image Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-[13.5px] font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <ImageIcon size={15} className="text-violet-500" /> Cover Thumbnail
                </h3>

                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200">
                    <img src={imagePreview} className="w-full h-36 object-cover" alt="Cover Preview" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/70 hover:bg-slate-900/90 text-white rounded-full transition-colors shadow"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-violet-400 rounded-lg p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-150 group-hover:bg-violet-50 transition-colors">
                      <ImageIcon size={16} className="text-slate-400 group-hover:text-violet-500" />
                    </div>
                    <div>
                      <span className="block text-[12px] font-bold text-slate-700">Upload Image</span>
                      <span className="block text-[10.5px] text-slate-400 mt-0.5">PNG, JPG, max 3MB</span>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {errors.image && <p className="text-red-500 text-[11.5px] mt-1">{errors.image}</p>}

                {/* Image URL link input option */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="block text-[11.5px] font-semibold text-slate-500 mb-1">
                    Or Image URL Link
                  </label>
                  <input
                    type="text"
                    value={data.image_url_link || ''}
                    onChange={e => {
                      const val = e.target.value
                      setData(prev => ({
                        ...prev,
                        image_url_link: val,
                        image: null,
                        image_cleared: val ? false : prev.image_cleared,
                      }))
                      if (val) {
                        setImagePreview(val)
                      } else {
                        setImagePreview(null)
                      }
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full h-8 px-2.5 text-[12px] rounded-lg border border-slate-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all outline-none"
                  />
                  {errors.image_url_link && <p className="text-red-500 text-[11.5px] mt-1">{errors.image_url_link}</p>}
                </div>
              </div>

              {/* SEO & Meta Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-[13.5px] font-bold text-slate-800">
                    SEO Meta
                  </h3>
                  <button
                    type="button"
                    onClick={suggestSeo}
                    disabled={suggesting}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-violet-600 hover:text-violet-850 transition-colors disabled:opacity-50"
                  >
                    <Sparkles size={12} className={suggesting ? 'animate-pulse' : ''} />
                    {suggesting ? 'Suggesting...' : 'AI Suggest'}
                  </button>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-500 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    placeholder="Short description for SEO snippets (Google searches)..."
                    rows="3"
                    className="w-full p-2.5 text-[12px] rounded-lg border border-slate-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all outline-none text-slate-600 resize-none leading-normal"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Ideal length: 150-160 characters.
                  </p>
                  {errors.description && <p className="text-red-500 text-[11.5px] mt-1">{errors.description}</p>}
                </div>

                {/* Tags Picker */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                    <TagIcon size={12} /> Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {data.tags.map((tag, idx) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-violet-50 text-violet-700 text-[11.5px] font-medium border border-violet-100"
                      >
                        {tag}
                        <button type="button" onClick={() => removeTag(idx)}>
                          <X size={11} className="text-violet-400 hover:text-violet-600" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tag and press Enter"
                    className="w-full h-8 px-2.5 text-[12px] rounded-lg border border-slate-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </AdminLayout>
    </>
  )
}
