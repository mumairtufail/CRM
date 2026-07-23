<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A personal callback number for Twilio click-to-call bridging is
        // distinct from the org's public contact number below — each agent
        // needs their own, so it stays on the user row.
        Schema::table('users', function (Blueprint $table) {
            $table->string('callback_phone', 50)->nullable()->after('company_phone');
        });

        DB::table('users')->whereNotNull('company_phone')->orderBy('id')->get(['id', 'company_phone'])
            ->each(fn ($user) => DB::table('users')->where('id', $user->id)->update(['callback_phone' => $user->company_phone]));

        Schema::table('organizations', function (Blueprint $table) {
            $table->string('company_name')->nullable()->after('name');
            $table->string('company_logo')->nullable()->after('company_name');
            $table->string('company_website')->nullable()->after('company_logo');
            $table->string('company_phone', 50)->nullable()->after('company_website');
            $table->string('company_email')->nullable()->after('company_phone');
            $table->string('company_linkedin')->nullable()->after('company_email');
        });

        // Backfill each organization's branding from its owner's previous per-user settings.
        DB::table('organizations')->orderBy('id')->get(['id', 'owner_id'])->each(function ($org) {
            $owner = DB::table('users')->where('id', $org->owner_id)->first([
                'company_name', 'company_logo', 'company_website', 'company_phone', 'company_email', 'company_linkedin',
            ]);
            if (! $owner) return;

            DB::table('organizations')->where('id', $org->id)->update([
                'company_name'     => $owner->company_name,
                'company_logo'     => $owner->company_logo,
                'company_website'  => $owner->company_website,
                'company_phone'    => $owner->company_phone,
                'company_email'    => $owner->company_email,
                'company_linkedin' => $owner->company_linkedin,
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'company_name', 'company_logo', 'company_website',
                'company_phone', 'company_email', 'company_linkedin',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('company_name')->nullable()->after('name');
            $table->string('company_logo')->nullable()->after('company_name');
            $table->string('company_website')->nullable()->after('company_logo');
            $table->string('company_phone', 50)->nullable()->after('company_website');
            $table->string('company_email')->nullable()->after('company_phone');
            $table->string('company_linkedin')->nullable()->after('company_email');
        });

        DB::table('users')->orderBy('organization_id')->get(['id', 'organization_id'])->each(function ($user) {
            $org = DB::table('organizations')->where('id', $user->organization_id)->first([
                'company_name', 'company_logo', 'company_website', 'company_phone', 'company_email', 'company_linkedin',
            ]);
            if (! $org) return;

            DB::table('users')->where('id', $user->id)->update([
                'company_name'     => $org->company_name,
                'company_logo'     => $org->company_logo,
                'company_website'  => $org->company_website,
                'company_phone'    => $org->company_phone,
                'company_email'    => $org->company_email,
                'company_linkedin' => $org->company_linkedin,
            ]);
        });

        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn([
                'company_name', 'company_logo', 'company_website',
                'company_phone', 'company_email', 'company_linkedin',
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('callback_phone');
        });
    }
};
