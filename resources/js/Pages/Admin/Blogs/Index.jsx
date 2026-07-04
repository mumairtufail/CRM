import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import { BookOpen, Calendar, Edit2, Eye, EyeOff, Plus, Tag as TagIcon, Trash2, User, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import axios from 'axios'
import ConfirmDialog from '@/Components/Common/ConfirmDialog'

export default function Index({ blogs }) {
  const [generating, setGenerating] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBlogId, setSelectedBlogId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const togglePublish = (id) => {
    router.patch(`/admin/blogs/${id}/toggle`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Blog publication status updated!')
      }
    })
  }

  const requestDeleteBlog = (id) => {
    setSelectedBlogId(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteBlog = () => {
    if (!selectedBlogId) return
    setDeleting(true)
    router.delete(`/admin/blogs/${selectedBlogId}`, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false)
        setSelectedBlogId(null)
        toast.success('Blog post deleted.')
      },
      onFinish: () => {
        setDeleting(false)
      }
    })
  }

  const generateAiBlog = async () => {
    setGenerating(true)
    const toastId = toast.loading('AI is searching trending topics and writing the blog post...')

    try {
      const response = await axios.post('/admin/blogs/ai-generate')
      toast.success(response.data.message || 'AI Blog post generated successfully!', { id: toastId })
      router.reload({ preserveScroll: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate AI blog.'
      toast.error(msg, { id: toastId })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <Head title="Admin · Blogs" />
      <AdminLayout title="Blogs">
        <div className="py-6 px-4 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-[20px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                <BookOpen size={22} className="text-violet-600" />
                Blog Posts
              </h1>
              <p className="text-[13px] text-slate-400 font-normal leading-relaxed">
                Create, edit, and publish search engine optimized blog posts for the marketing site.
              </p>
            </div>
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={generateAiBlog}
                disabled={generating}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[13px] font-bold shadow-sm shadow-amber-500/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {generating ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Sparkles size={15} />
                )}
                AI Write Blog
              </button>
              <Link
                href="/admin/blogs/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[13px] font-bold shadow-sm shadow-violet-500/10 transition-colors"
              >
                <Plus size={15} /> Write Post
              </Link>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-5">Blog Details</th>
                    <th className="py-3.5 px-5">Tags</th>
                    <th className="py-3.5 px-5">Author</th>
                    <th className="py-3.5 px-5">Published</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {blogs.data.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400">
                        <BookOpen className="mx-auto text-slate-300 mb-3" size={32} />
                        No blog posts found. Click "Write Post" to create one.
                      </td>
                    </tr>
                  ) : (
                    blogs.data.map((blog) => (
                      <tr key={blog.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Details */}
                        <td className="py-4 px-5 max-w-sm">
                          <div className="flex gap-4">
                            <div className="w-16 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {blog.image_url ? (
                                <img src={blog.image_url} className="object-cover w-full h-full" alt="" />
                              ) : (
                                <BookOpen size={16} className="text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="block font-bold text-slate-700 truncate hover:text-violet-600 transition-colors">
                                {blog.title}
                              </span>
                              <span className="block text-[11.5px] text-slate-400 truncate mt-0.5">
                                {blog.subtitle || 'No subtitle provided'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Tags */}
                        <td className="py-4 px-5">
                          <div className="flex flex-wrap gap-1">
                            {blog.tags.length === 0 ? (
                              <span className="text-[11.5px] text-slate-400">None</span>
                            ) : (
                              blog.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium text-slate-600 border border-slate-150"
                                >
                                  <TagIcon size={9} /> {tag}
                                </span>
                              ))
                            )}
                          </div>
                        </td>

                        {/* Author */}
                        <td className="py-4 px-5 text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <User size={13} className="text-slate-400" />
                            <span>{blog.author_name}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                                blog.is_published
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                                  : 'bg-amber-50 text-amber-700 border-amber-150'
                              }`}
                            >
                              {blog.is_published ? <Eye size={11} /> : <EyeOff size={11} />}
                              {blog.is_published ? 'Approved' : 'Pending'}
                            </span>
                            
                            <button
                              type="button"
                              onClick={() => togglePublish(blog.id)}
                              className={`px-2.5 py-1 rounded text-[11.5px] font-bold transition-all cursor-pointer ${
                                blog.is_published
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/10'
                              }`}
                            >
                              {blog.is_published ? 'Unpublish' : 'Approve'}
                            </button>

                            {blog.is_published && blog.published_at && (
                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Calendar size={11} />
                                {new Date(blog.published_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/blogs/${blog.id}/edit`}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors"
                              title="Edit post"
                            >
                              <Edit2 size={13.5} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => requestDeleteBlog(blog.id)}
                              className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                              title="Delete post"
                            >
                              <Trash2 size={13.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {blogs.links && blogs.links.length > 3 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-[12px] text-slate-400">
                  Showing {blogs.from} to {blogs.to} of {blogs.total} posts
                </span>
                <div className="flex gap-1">
                  {blogs.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.url}
                      disabled={!link.url}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                      className={`px-3 py-1 rounded-lg border text-[12.5px] transition-colors ${
                        link.active
                          ? 'bg-violet-600 border-violet-600 text-white font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      } ${!link.url && 'opacity-50 cursor-not-allowed hover:bg-white'}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <ConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Delete Blog Post"
          description="Are you sure you want to delete this blog post? This action cannot be undone."
          onConfirm={confirmDeleteBlog}
          loading={deleting}
          confirmText="Delete"
          loadingText="Deleting..."
        />
      </AdminLayout>
    </>
  )
}
