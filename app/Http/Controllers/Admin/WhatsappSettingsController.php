<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Organization;
use App\Models\PlatformWhatsappCredential;
use App\Models\WhatsappCredentialAuditLog;
use App\Models\WhatsappUnassignedInbound;
use App\Models\WhatsappUsageMonthly;
use App\Services\WhatsappService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsappSettingsController extends Controller
{
    public function index(Request $request)
    {
        $credential = PlatformWhatsappCredential::latest()->first();

        $tenantQuery = Organization::with('whatsappSettings');

        if ($tenantSearch = $request->input('tenant_search')) {
            $tenantQuery->where(function ($q) use ($tenantSearch) {
                $q->where('name', 'like', "%{$tenantSearch}%")
                  ->orWhere('slug', 'like', "%{$tenantSearch}%");
            });
        }

        $organizations = $tenantQuery->orderBy('name')
            ->paginate(20, ['*'], 'tenant_page', (int) $request->input('tenant_page', 1))
            ->withQueryString()
            ->through(function ($org) {
                $settings = $org->whatsappSettings;
                $usage    = WhatsappUsageMonthly::currentMonthFor($org->id);

                return [
                    'id'                    => $org->id,
                    'name'                  => $org->name,
                    'slug'                  => $org->slug,
                    'is_enabled'            => (bool) $settings?->is_enabled,
                    'plan_type'             => $settings?->plan_type ?? 'trial',
                    'monthly_message_quota' => $settings?->monthly_message_quota,
                    'billing_note'          => $settings?->billing_note,
                    'used_this_month'       => $usage?->sent_count ?? 0,
                    'failed_this_month'     => $usage?->failed_count ?? 0,
                ];
            });

        $inbound = WhatsappUnassignedInbound::where('status', 'pending')
            ->latest()
            ->paginate(20, ['*'], 'inbound_page', (int) $request->input('inbound_page', 1))
            ->withQueryString()
            ->through(function ($row) {
                $candidateOrgs = collect($row->matched_organization_ids ?? [])
                    ->map(fn ($id) => Organization::find($id))
                    ->filter()
                    ->map(fn ($o) => ['id' => $o->id, 'name' => $o->name])
                    ->values();

                return [
                    'id'              => $row->id,
                    'from_number'     => $row->from_number,
                    'body'            => $row->body,
                    'message_type'    => $row->message_type,
                    'candidate_orgs'  => $candidateOrgs,
                    'created_at'      => $row->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Admin/Whatsapp/Index', [
            'credential' => $credential ? [
                'id'                        => $credential->id,
                'meta_app_id'               => $credential->meta_app_id,
                'meta_business_account_id'  => $credential->meta_business_account_id,
                'phone_number_id'           => $credential->phone_number_id,
                'display_phone_number'      => $credential->display_phone_number,
                'access_token_masked'       => $this->maskLastFour($credential->access_token),
                'status'                    => $credential->status,
                'last_verified_at'          => $credential->last_verified_at?->toISOString(),
            ] : null,
            'auditLog' => WhatsappCredentialAuditLog::with('changedBy:id,name')
                ->latest()->limit(20)->get()
                ->map(fn ($log) => [
                    'id'         => $log->id,
                    'action'     => $log->action,
                    'changed_by' => $log->changedBy?->name,
                    'created_at' => $log->created_at->diffForHumans(),
                ]),
            'organizations'             => $organizations,
            'tenantFilters'             => $request->only(['tenant_search']),
            'platformCredentialActive'  => (bool) PlatformWhatsappCredential::active(),
            'inbound'                   => $inbound,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'current_password'          => ['required', 'current_password:admin'],
            'meta_app_id'                => 'nullable|string|max:255',
            'meta_business_account_id'   => 'required|string|max:255',
            'phone_number_id'            => 'required|string|max:255',
            'access_token'               => 'required|string|min:20',
            'meta_app_secret'            => 'required|string|min:10',
            'webhook_verify_token'       => 'required|string|min:8',
        ]);

        $transient = new PlatformWhatsappCredential([
            'phone_number_id' => $validated['phone_number_id'],
            'access_token'    => $validated['access_token'],
        ]);

        $result = (new WhatsappService($transient))->verify();

        if (!$result['success']) {
            WhatsappCredentialAuditLog::create([
                'action'     => 'test_connection_failed',
                'changed_by' => $request->user('admin')->id,
                'ip_address' => $request->ip(),
            ]);

            return back()->withErrors(['access_token' => 'Could not verify with Meta: ' . $result['message']]);
        }

        $credential = PlatformWhatsappCredential::first() ?? new PlatformWhatsappCredential();
        $credential->fill([
            'meta_app_id'              => $validated['meta_app_id'] ?? null,
            'meta_business_account_id' => $validated['meta_business_account_id'],
            'phone_number_id'          => $validated['phone_number_id'],
            'display_phone_number'     => $result['data']['display_phone_number'] ?? null,
            'access_token'             => $validated['access_token'],
            'meta_app_secret'          => $validated['meta_app_secret'],
            'webhook_verify_token'     => $validated['webhook_verify_token'],
            'status'                   => 'active',
            'last_verified_at'         => now(),
            'created_by'               => $request->user('admin')->id,
        ]);
        $credential->save();

        PlatformWhatsappCredential::forgetActiveCache();

        WhatsappCredentialAuditLog::create([
            'platform_whatsapp_credential_id' => $credential->id,
            'action'                          => 'updated',
            'changed_by'                      => $request->user('admin')->id,
            'changes'                         => array_keys($request->except(['current_password', 'access_token', 'meta_app_secret', 'webhook_verify_token'])),
            'ip_address'                      => $request->ip(),
        ]);

        return back()->with('success', 'WhatsApp credentials saved and verified.');
    }

    public function test(Request $request)
    {
        $credential = PlatformWhatsappCredential::active();

        if (!$credential) {
            return response()->json(['success' => false, 'message' => 'No active pooled WhatsApp credential configured.'], 422);
        }

        $result = (new WhatsappService($credential))->verify();

        WhatsappCredentialAuditLog::create([
            'platform_whatsapp_credential_id' => $credential->id,
            'action'                          => $result['success'] ? 'test_connection_success' : 'test_connection_failed',
            'changed_by'                      => $request->user('admin')->id,
            'ip_address'                      => $request->ip(),
        ]);

        if ($result['success']) {
            $credential->update(['last_verified_at' => now()]);
            PlatformWhatsappCredential::forgetActiveCache();
        }

        return response()->json($result);
    }

    private function maskLastFour(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        return '••••' . substr($value, -4);
    }
}
