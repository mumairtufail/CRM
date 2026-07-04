import { Head } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import FormBuilder from '@/Components/Forms/FormBuilder'

export default function FormsCreate({ builtinCatalog }) {
  return (
    <AppLayout noPadding={true}>
      <Head title="New Form" />
      <div className="flex flex-col h-full w-full p-4 md:p-6 min-h-0 overflow-hidden">
        <div className="mb-3 shrink-0">
          <h1 className="text-lg font-bold text-slate-800">New Form</h1>
          <p className="text-xs text-slate-400 font-normal mt-0.5">Choose the fields to collect, then share the public link.</p>
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          <FormBuilder
            builtinCatalog={builtinCatalog}
            submitUrl={route('forms.store')}
            method="post"
            submitLabel="Create Form"
          />
        </div>
      </div>
    </AppLayout>
  )
}
