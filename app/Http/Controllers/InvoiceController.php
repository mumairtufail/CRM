<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Lead;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with(['lead.emails'])
            ->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('lead', fn ($lq) => $lq->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('company', 'like', "%{$search}%"));
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $invoices = $query->paginate(20)->withQueryString();

        $invoices->getCollection()->transform(fn ($inv) => $this->formatInvoice($inv));

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'filters'  => $request->only(['search', 'status']),
            'totals'   => [
                'all'      => Invoice::count(),
                'draft'    => Invoice::where('status', 'draft')->count(),
                'sent'     => Invoice::where('status', 'sent')->count(),
                'paid'     => Invoice::where('status', 'paid')->count(),
                'overdue'  => Invoice::where('status', 'overdue')->count(),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Invoices/Create', [
            'leads'         => Lead::with('emails')->orderBy('first_name')->get()
                ->map(fn ($l) => [
                    'id'            => $l->id,
                    'full_name'     => $l->full_name,
                    'company'       => $l->company,
                    'primary_email' => $l->primary_email,
                ]),
            'next_number'   => Invoice::nextNumber(),
            'default_dates' => [
                'issue' => now()->toDateString(),
                'due'   => now()->addDays(30)->toDateString(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'lead_id'      => 'nullable|exists:leads,id',
            'invoice_number' => 'required|string|unique:invoices,invoice_number',
            'status'       => 'required|in:draft,sent,paid,overdue',
            'issue_date'   => 'required|date',
            'due_date'     => 'required|date|after_or_equal:issue_date',
            'tax_rate'     => 'nullable|numeric|min:0|max:100',
            'notes'        => 'nullable|string',
            'items'        => 'required|array|min:1',
            'items.*.description' => 'required|string|max:500',
            'items.*.quantity'    => 'required|numeric|min:0.01',
            'items.*.rate'        => 'required|numeric|min:0',
        ]);

        $items    = $validated['items'];
        $taxRate  = (float) ($validated['tax_rate'] ?? 0);
        $subtotal = collect($items)->sum(fn ($i) => round($i['quantity'] * $i['rate'], 2));
        $taxAmt   = round($subtotal * $taxRate / 100, 2);

        $invoice = Invoice::create([
            'lead_id'        => $validated['lead_id'] ?? null,
            'invoice_number' => $validated['invoice_number'],
            'status'         => $validated['status'],
            'issue_date'     => $validated['issue_date'],
            'due_date'       => $validated['due_date'],
            'subtotal'       => $subtotal,
            'tax_rate'       => $taxRate,
            'tax_amount'     => $taxAmt,
            'total'          => $subtotal + $taxAmt,
            'notes'          => $validated['notes'] ?? null,
        ]);

        foreach ($items as $i => $item) {
            $invoice->items()->create([
                'description' => $item['description'],
                'quantity'    => $item['quantity'],
                'rate'        => $item['rate'],
                'amount'      => round($item['quantity'] * $item['rate'], 2),
                'sort_order'  => $i,
            ]);
        }

        return redirect()->route('invoices.show', $invoice)
            ->with('success', "Invoice {$invoice->invoice_number} created.");
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['lead.emails', 'items']);

        return Inertia::render('Invoices/Show', [
            'invoice' => $this->formatInvoice($invoice, detail: true),
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'lead_id'      => 'nullable|exists:leads,id',
            'invoice_number' => 'required|string|unique:invoices,invoice_number,' . $invoice->id,
            'status'       => 'required|in:draft,sent,paid,overdue',
            'issue_date'   => 'required|date',
            'due_date'     => 'required|date|after_or_equal:issue_date',
            'tax_rate'     => 'nullable|numeric|min:0|max:100',
            'notes'        => 'nullable|string',
            'items'        => 'required|array|min:1',
            'items.*.description' => 'required|string|max:500',
            'items.*.quantity'    => 'required|numeric|min:0.01',
            'items.*.rate'        => 'required|numeric|min:0',
        ]);

        $items    = $validated['items'];
        $taxRate  = (float) ($validated['tax_rate'] ?? 0);
        $subtotal = collect($items)->sum(fn ($i) => round($i['quantity'] * $i['rate'], 2));
        $taxAmt   = round($subtotal * $taxRate / 100, 2);

        $invoice->update([
            'lead_id'        => $validated['lead_id'] ?? null,
            'invoice_number' => $validated['invoice_number'],
            'status'         => $validated['status'],
            'issue_date'     => $validated['issue_date'],
            'due_date'       => $validated['due_date'],
            'subtotal'       => $subtotal,
            'tax_rate'       => $taxRate,
            'tax_amount'     => $taxAmt,
            'total'          => $subtotal + $taxAmt,
            'notes'          => $validated['notes'] ?? null,
        ]);

        $invoice->items()->delete();
        foreach ($items as $i => $item) {
            $invoice->items()->create([
                'description' => $item['description'],
                'quantity'    => $item['quantity'],
                'rate'        => $item['rate'],
                'amount'      => round($item['quantity'] * $item['rate'], 2),
                'sort_order'  => $i,
            ]);
        }

        return redirect()->route('invoices.show', $invoice)
            ->with('success', "Invoice {$invoice->invoice_number} updated.");
    }

    public function send(Request $request, Invoice $invoice)
    {
        $request->validate(['email' => 'required|email']);

        $invoice->update([
            'status'        => 'sent',
            'sent_to_email' => $request->email,
            'sent_at'       => now(),
        ]);

        return back()->with('success', "Invoice marked as sent to {$request->email}.");
    }

    public function destroy(Invoice $invoice)
    {
        $number = $invoice->invoice_number;
        $invoice->delete();

        return redirect()->route('invoices.index')
            ->with('success', "Invoice {$number} deleted.");
    }

    private function formatInvoice(Invoice $invoice, bool $detail = false): array
    {
        $lead = $invoice->lead;
        $data = [
            'id'             => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'status'         => $invoice->status,
            'issue_date'     => $invoice->issue_date?->toDateString(),
            'due_date'       => $invoice->due_date?->toDateString(),
            'subtotal'       => (float) $invoice->subtotal,
            'tax_rate'       => (float) $invoice->tax_rate,
            'tax_amount'     => (float) $invoice->tax_amount,
            'total'          => (float) $invoice->total,
            'notes'          => $invoice->notes,
            'sent_to_email'  => $invoice->sent_to_email,
            'sent_at'        => $invoice->sent_at?->format('d M Y'),
            'created_at'     => $invoice->created_at->diffForHumans(),
            'lead'           => $lead ? [
                'id'            => $lead->id,
                'full_name'     => $lead->full_name,
                'company'       => $lead->company,
                'primary_email' => $lead->primary_email,
            ] : null,
        ];

        if ($detail) {
            $data['items'] = $invoice->items->map(fn ($item) => [
                'id'          => $item->id,
                'description' => $item->description,
                'quantity'    => (float) $item->quantity,
                'rate'        => (float) $item->rate,
                'amount'      => (float) $item->amount,
            ])->toArray();
        }

        return $data;
    }
}
