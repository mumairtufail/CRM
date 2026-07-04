import { LogoMark } from '@/Components/Common/Logo'
import { Eye } from 'lucide-react'

const TYPE_HEIGHTS = { textarea: 'h-14' }

function FieldPreview({ field }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium text-slate-600">
        {field.label || 'Untitled field'}
        {field.required && <span className="text-violet-500 ml-0.5">*</span>}
      </p>
      <div className={`rounded-lg border border-slate-200 bg-slate-50/70 ${TYPE_HEIGHTS[field.type] ?? 'h-8'}`} />
    </div>
  )
}

/**
 * Read-only mock of the public form, live-updated as the admin edits it in
 * FormBuilder. Gives a sense of what recipients will actually see, so the
 * empty space next to the builder does something useful instead of nothing.
 */
export default function FormPreviewPanel({ data }) {
  return (
    <div className="sticky top-6 space-y-2.5">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
        <Eye size={12} />
        Live preview
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-100/60 p-3 shadow-sm">
        <div className="flex items-center gap-1.5 mb-3 px-1">
          <span className="w-2 h-2 rounded-full bg-slate-300" />
          <span className="w-2 h-2 rounded-full bg-slate-300" />
          <span className="w-2 h-2 rounded-full bg-slate-300" />
        </div>

        <div className="rounded-xl bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-5">
          <div className="text-center mb-5">
            <div
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl mb-2.5 shadow-md"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }}
            >
              <LogoMark size={18} className="opacity-95" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-900 leading-tight">
              {data.name || 'Your form name'}
            </h3>
            {data.description && (
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{data.description}</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            {data.fields.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-4">Add fields to see them here</p>
            ) : (
              data.fields.map(f => <FieldPreview key={f.key} field={f} />)
            )}
            <div
              className="w-full h-8 rounded-lg mt-1"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)', opacity: 0.9 }}
            />
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 px-1">
        This is a simplified preview — the real form matches your brand colors and is fully responsive.
      </p>
    </div>
  )
}
