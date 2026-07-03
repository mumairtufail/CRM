<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * The full catalog of permissions available across all organizations.
     * Grouped by module for the checkbox-grid editor in Settings > Roles.
     */
    public const CATALOG = [
        'leads' => [
            'leads.view'   => 'View leads',
            'leads.create' => 'Create leads',
            'leads.edit'   => 'Edit leads',
            'leads.delete' => 'Delete leads',
            'leads.import' => 'Import leads',
            'leads.export' => 'Export leads',
            'leads.assign' => 'Assign leads to team members',
        ],
        'pipeline' => [
            'pipeline.view'   => 'View pipeline',
            'pipeline.manage' => 'Manage pipeline stages and deals',
        ],
        'campaigns' => [
            'campaigns.view'   => 'View campaigns',
            'campaigns.create' => 'Create campaigns',
            'campaigns.send'   => 'Send campaigns',
            'campaigns.delete' => 'Delete campaigns',
        ],
        'whatsapp' => [
            'whatsapp.view_conversations' => 'View WhatsApp conversations',
            'whatsapp.send_messages'      => 'Send WhatsApp messages',
        ],
        'inbox' => [
            'inbox.view' => 'View inbox',
            'inbox.send' => 'Send email from inbox',
        ],
        'clients_projects' => [
            'clients.view'  => 'View clients',
            'clients.manage' => 'Manage clients',
            'projects.view'  => 'View projects',
            'projects.manage' => 'Manage projects',
        ],
        'invoices' => [
            'invoices.view'   => 'View invoices',
            'invoices.create' => 'Create invoices',
            'invoices.send'   => 'Send invoices',
            'invoices.delete' => 'Delete invoices',
        ],
        'team' => [
            'team.view'         => 'View team members',
            'team.manage'       => 'Add, edit, and remove team members',
            'team.manage_roles' => 'Create, edit, and delete roles',
        ],
        'settings' => [
            'settings.view'   => 'View organization settings',
            'settings.manage' => 'Manage organization settings',
        ],
        'dashboard' => [
            'dashboard.view_own' => 'View own performance dashboard',
            'dashboard.view_all' => 'View organization-wide dashboard',
        ],
        'reports' => [
            'reports.view' => 'View reports & analytics',
        ],
    ];

    /**
     * Default permission set granted to the seeded "Agent" role.
     */
    public const AGENT_DEFAULTS = [
        'leads.view', 'leads.edit',
        'pipeline.view',
        'campaigns.view', 'campaigns.send',
        'whatsapp.view_conversations', 'whatsapp.send_messages',
        'inbox.view', 'inbox.send',
        'dashboard.view_own',
    ];

    public function run(): void
    {
        foreach (self::CATALOG as $group => $permissions) {
            foreach ($permissions as $key => $label) {
                Permission::updateOrCreate(['key' => $key], ['group' => $group, 'label' => $label]);
            }
        }

        $this->backfillDefaultAgentRole();
    }

    /**
     * Organizations created before the roles & permissions system existed never
     * got a default "Agent" role — OrganizationObserver only seeds one when a new
     * Organization row is created, not retroactively. Back-fill any org that's
     * missing one so existing workspaces can assign team members immediately.
     * Idempotent: skips orgs that already have a default role.
     */
    private function backfillDefaultAgentRole(): void
    {
        $agentPermissionIds = Permission::whereIn('key', self::AGENT_DEFAULTS)->pluck('id');

        Organization::whereDoesntHave('roles', fn ($q) => $q->where('is_default', true))
            ->each(function (Organization $organization) use ($agentPermissionIds) {
                // A role literally named "Agent" may already exist for this org (e.g.
                // someone created one by hand before this backfill ran) — reuse it
                // rather than colliding with the (organization_id, name) unique index.
                $role = Role::firstOrCreate(
                    ['organization_id' => $organization->id, 'name' => 'Agent'],
                    ['is_default' => true]
                );

                if (! $role->is_default) {
                    $role->update(['is_default' => true]);
                }

                // Don't clobber permissions someone already configured by hand.
                if ($role->permissions()->count() === 0) {
                    $role->permissions()->sync($agentPermissionIds);
                }
            });
    }
}
