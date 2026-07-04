import { Head } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import FormBuilder from '@/Components/Forms/FormBuilder'

export default function FormsEdit({ form, builtinCatalog }) {
  return (
    <AppLayout noPadding={true}>
      <Head title={`Edit ${form.name}`} />
      <div className="flex flex-col h-full w-full p-4 md:p-6 min-h-0 overflow-hidden">
        <div className="mb-3 shrink-0">
          <h1 className="text-lg font-bold text-slate-800">Edit Form</h1>
          <p className="text-xs text-slate-400 font-normal mt-0.5">Changes apply immediately — the public link stays the same.</p>
        </div>
        <div className="flex-1 min-h-0">
          <FormBuilder
            builtinCatalog={builtinCatalog}
            initial={form}
            submitUrl={route('forms.update', form.id)}
            method="put"
            submitLabel="Save Changes"
          />
        </div>
      </div>
    </AppLayout>
  )
}
