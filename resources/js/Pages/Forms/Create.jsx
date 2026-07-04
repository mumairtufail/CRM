import { useState } from 'react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import FormBuilder from '@/Components/Forms/FormBuilder'
import FormPreviewPanel from '@/Components/Forms/FormPreviewPanel'

export default function FormsCreate({ builtinCatalog }) {
  const [preview, setPreview] = useState({ name: '', description: '', fields: [] })

  return (
    <AppLayout>
      <Head title="New Form" />
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <h1 className="text-[18px] font-bold text-slate-800">New Form</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Choose the fields to collect, then share the public link.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <FormBuilder
            builtinCatalog={builtinCatalog}
            submitUrl={route('forms.store')}
            method="post"
            submitLabel="Create Form"
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
