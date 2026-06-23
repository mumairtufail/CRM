<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Lead;
use App\Models\LeadEmail;
use App\Models\LeadPhone;
use App\Models\Organization;
use App\Models\Project;
use App\Support\TenantContext;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Pakistani real estate CRM demo data.
 *
 * Run in isolation:
 *   php artisan db:seed --class=PakistaniDemoSeeder
 *
 * Attaches everything to the first existing organization (your workspace). All
 * money is in PKR. Invoices link to a lead (the schema has no client_id on
 * invoices), so each invoice points at the lead its client was converted from.
 */
class PakistaniDemoSeeder extends Seeder
{
    public function run(): void
    {
        // Attach to the first existing workspace; create a demo one if none exists.
        $organization = Organization::query()->orderBy('id')->first()
            ?? Organization::create(['name' => 'Demo Workspace', 'slug' => 'demo']);

        // Scope every create() below to this tenant (auto-stamps organization_id).
        app(TenantContext::class)->set($organization);

        $now = Carbon::parse('2026-06-22');

        /* ---------------------------------------------------------------------
         | 10 LEADS — mix of statuses, PKR deal values, Pakistani cities
         * ------------------------------------------------------------------- */
        $leads = [
            // 5 "won" leads (these get converted into clients below)
            ['Ahmed', 'Raza', 'Al Noor Properties Lahore', 'Director', 'Lahore', 'won', 'qualified', 12_500_000, 'ahmed.raza@alnoorproperties.pk', '+92 300 4521789'],
            ['Imran', 'Sheikh', 'DHA City Realtors Karachi', 'CEO', 'Karachi', 'won', 'high', 22_000_000, 'imran.sheikh@dhacityrealtors.pk', '+92 321 2789456'],
            ['Sana', 'Javed', 'Emaar Associates Islamabad', 'Sales Head', 'Islamabad', 'won', 'high', 18_000_000, 'sana.javed@emaarassociates.pk', '+92 333 5123890'],
            ['Bilal', 'Ahmed', 'Zameen Developers DHA', 'Partner', 'Lahore', 'won', 'medium', 8_500_000, 'bilal.ahmed@zameendevelopers.pk', '+92 301 9087654'],
            ['Fatima', 'Khan', 'Prime Estates Karachi', 'Managing Director', 'Karachi', 'won', 'high', 28_000_000, 'fatima.khan@primeestates.pk', '+92 345 6789012'],

            // 5 leads still in the pipeline (covers the remaining statuses)
            ['Usman', 'Malik', 'Capital Smart Estates Islamabad', 'Owner', 'Islamabad', 'negotiation', 'high', 35_000_000, 'usman.malik@capitalsmart.pk', '+92 322 4567890'],
            ['Ayesha', 'Siddiqui', 'Gulberg Realty Lahore', 'Broker', 'Lahore', 'proposal', 'medium', 4_200_000, 'ayesha.siddiqui@gulbergrealty.pk', '+92 300 1234567'],
            ['Hina', 'Tariq', 'Bahria Town Brokers Karachi', 'Consultant', 'Karachi', 'qualified', 'medium', 1_800_000, 'hina.tariq@bahriabrokers.pk', '+92 311 7654321'],
            ['Kashif', 'Mahmood', 'Lake City Properties Lahore', 'Agent', 'Lahore', 'contacted', 'low', 6_750_000, 'kashif.mahmood@lakecityproperties.pk', '+92 308 2345678'],
            ['Zainab', 'Abbas', 'Park View Estates Islamabad', 'Coordinator', 'Islamabad', 'new', 'low', 500_000, 'zainab.abbas@parkviewestates.pk', '+92 334 8901234'],
        ];

        /** @var array<int, Lead> $leadModels keyed by company for later linking */
        $leadModels = [];

        foreach ($leads as $i => [$first, $last, $company, $title, $city, $status, $priority, $value, $email, $phone]) {
            $lead = Lead::create([
                'first_name'        => $first,
                'last_name'         => $last,
                'company'           => $company,
                'job_title'         => $title,
                'source'            => 'manual',
                'status'            => $status,
                'priority'          => $priority,
                'deal_value'        => $value,
                'currency'          => 'PKR',
                'country'           => 'Pakistan',
                'city'              => $city,
                'industry'          => 'Real Estate',
                'notes'             => "{$company} — interested in CRM/agency portal solution.",
                'last_contacted_at' => $now->copy()->subDays(($i + 1) * 2),
                'follow_up_at'      => $status === 'won' ? null : $now->copy()->addDays($i + 3),
            ]);

            LeadEmail::create([
                'lead_id'    => $lead->id,
                'email'      => $email,
                'type'       => 'work',
                'is_primary' => true,
                'is_verified'=> true,
            ]);

            LeadPhone::create([
                'lead_id'    => $lead->id,
                'phone'      => $phone,
                'type'       => 'mobile',
                'is_primary' => true,
            ]);

            $leadModels[$first . ' ' . $last] = $lead;
        }

        /* ---------------------------------------------------------------------
         | 5 CLIENTS — converted from the 5 "won" leads, all active
         * ------------------------------------------------------------------- */
        $clientSpecs = [
            ['Ahmed Raza',  'Al Noor Properties Lahore',       'ahmed.raza@alnoorproperties.pk',   '+92 300 4521789', 12_500_000],
            ['Imran Sheikh','DHA City Realtors Karachi',       'imran.sheikh@dhacityrealtors.pk',  '+92 321 2789456', 22_000_000],
            ['Sana Javed',  'Emaar Associates Islamabad',      'sana.javed@emaarassociates.pk',    '+92 333 5123890', 18_000_000],
            ['Bilal Ahmed', 'Zameen Developers DHA',           'bilal.ahmed@zameendevelopers.pk',  '+92 301 9087654', 8_500_000],
            ['Fatima Khan', 'Prime Estates Karachi',           'fatima.khan@primeestates.pk',      '+92 345 6789012', 28_000_000],
        ];

        /** @var array<string, Client> $clients keyed by name */
        $clients = [];

        foreach ($clientSpecs as $j => [$name, $company, $email, $phone, $value]) {
            $lead = $leadModels[$name];

            $clients[$name] = Client::create([
                'lead_id'      => $lead->id,
                'name'         => $name,
                'email'        => $email,
                'phone'        => $phone,
                'company'      => $company,
                'job_title'    => $lead->job_title,
                'status'       => 'active',
                'deal_value'   => $value,
                'currency'     => 'PKR',
                'notes'        => 'Converted from won lead. Active engagement.',
                'converted_at' => $now->copy()->subDays(($j + 1) * 5),
            ]);
        }

        /* ---------------------------------------------------------------------
         | 3 PROJECTS — linked to the first 3 clients, mix of active/completed
         * ------------------------------------------------------------------- */
        $projectSpecs = [
            ['DHA Phase 6 CRM Setup',     'Ahmed Raza',  'active',    3_500_000, '-30 days', '+45 days', 'End-to-end CRM rollout for DHA Phase 6 sales team.'],
            ['Bahria Town Agency Portal', 'Imran Sheikh','completed', 5_200_000, '-120 days','-10 days', 'Self-service agency portal for Bahria Town brokers. Delivered.'],
            ['Gulberg Office Automation', 'Sana Javed',  'active',    2_800_000, '-15 days', '+60 days', 'Office workflow automation and lead routing for Gulberg branch.'],
        ];

        foreach ($projectSpecs as [$pname, $clientName, $status, $budget, $start, $due, $desc]) {
            Project::create([
                'client_id'   => $clients[$clientName]->id,
                'name'        => $pname,
                'description' => $desc,
                'status'      => $status,
                'start_date'  => $now->copy()->modify($start)->toDateString(),
                'due_date'    => $now->copy()->modify($due)->toDateString(),
                'budget'      => $budget,
                'currency'    => 'PKR',
            ]);
        }

        /* ---------------------------------------------------------------------
         | 2 INVOICES — one paid, one "pending" (status: sent). Linked to the
         | lead behind each client. PKR amounts, with line items.
         * ------------------------------------------------------------------- */

        // Invoice 1 — PAID — Ahmed Raza / Al Noor Properties Lahore
        $paid = Invoice::create([
            'lead_id'        => $clients['Ahmed Raza']->lead_id,
            'invoice_number' => Invoice::nextNumber(),
            'status'         => 'paid',
            'issue_date'     => $now->copy()->subDays(40)->toDateString(),
            'due_date'       => $now->copy()->subDays(25)->toDateString(),
            'notes'          => 'DHA Phase 6 CRM Setup — initial milestone. Paid in full.',
            'sent_to_email'  => 'ahmed.raza@alnoorproperties.pk',
            'sent_at'        => $now->copy()->subDays(40),
        ]);
        $this->addItems($paid, [
            ['CRM software setup & configuration', 1, 2_000_000],
            ['Data migration from spreadsheets',   1, 450_000],
            ['Staff training (3 sessions)',        3, 150_000],
        ]);

        // Invoice 2 — PENDING (status: sent) — Imran Sheikh / DHA City Realtors Karachi
        $pending = Invoice::create([
            'lead_id'        => $clients['Imran Sheikh']->lead_id,
            'invoice_number' => Invoice::nextNumber(),
            'status'         => 'sent',
            'issue_date'     => $now->copy()->subDays(8)->toDateString(),
            'due_date'       => $now->copy()->addDays(7)->toDateString(),
            'notes'          => 'Bahria Town Agency Portal — Phase 1. Payment pending.',
            'sent_to_email'  => 'imran.sheikh@dhacityrealtors.pk',
            'sent_at'        => $now->copy()->subDays(8),
        ]);
        $this->addItems($pending, [
            ['Agency portal development — Phase 1', 1, 3_500_000],
            ['Annual support & maintenance',        1, 800_000],
        ]);

        $this->command?->info('Pakistani real estate demo data seeded: 10 leads, 5 clients, 3 projects, 2 invoices.');
    }

    /**
     * Attach line items to an invoice and recalculate its totals (PKR, no tax).
     *
     * @param  array<int, array{0:string,1:int|float,2:int|float}>  $items
     */
    private function addItems(Invoice $invoice, array $items): void
    {
        $subtotal = 0;

        foreach ($items as $sort => [$desc, $qty, $rate]) {
            $amount   = $qty * $rate;
            $subtotal += $amount;

            InvoiceItem::create([
                'invoice_id'  => $invoice->id,
                'description' => $desc,
                'quantity'    => $qty,
                'rate'        => $rate,
                'amount'      => $amount,
                'sort_order'  => $sort,
            ]);
        }

        $invoice->update([
            'subtotal'   => $subtotal,
            'tax_rate'   => 0,
            'tax_amount' => 0,
            'total'      => $subtotal,
        ]);
    }
}
