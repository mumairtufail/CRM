<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The Leads index query is always tenant-scoped (organization_id, via the
     * BelongsToTenant global scope) and, in its default view, filters by
     * status and sorts by created_at. The existing indexes cover
     * organization_id and (status, created_at) separately, but MySQL can only
     * use one index per query — this composite index serves the actual
     * combined filter+sort directly.
     */
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->index(['organization_id', 'status', 'created_at'], 'leads_org_status_created_at');
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropIndex('leads_org_status_created_at');
        });
    }
};
