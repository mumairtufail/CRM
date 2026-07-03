import { useState } from 'react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import FormBuilder from '@/Components/Forms/FormBuilder'
import FormPreviewPanel from '@/Components/Forms/FormPreviewPanel'

export default function FormsEdit({ form, builtinCatalog }) {
  const [preview, setPreview] = useState({ name: form.name, description: form.description, fields: form.fields })

  return (
    <AppLayout>
      <Head title={`Edit ${form.name}`} />
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <h1 className="text-[18px] font-bold text-slate-800">Edit Form</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Changes apply immediately — the public link stays the same.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          <FormBuilder
            builtinCatalog={builtinCatalog}
            initial={form}
            submitUrl={route('forms.update', form.id)}
            method="put"
            submitLabel="Save Changes"
            onChange={setPreview}
          />
          <div className="hidden lg:block">
            <FormPreviewPanel data={preview} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
