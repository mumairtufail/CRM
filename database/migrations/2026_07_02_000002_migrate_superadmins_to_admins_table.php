<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Copies any existing platform superadmin rows out of `users` and into the new
     * `admins` table. Idempotent (skips emails already present in `admins`) so it is
     * safe to re-run. The old `users` rows are intentionally left in place here — a
     * later migration drops the `is_superadmin` column once the code that reads it
     * has been removed.
     */
    public function up(): void
    {
        $superadmins = DB::table('users')->where('is_superadmin', true)->get();

        foreach ($superadmins as $user) {
            if (DB::table('admins')->where('email', $user->email)->exists()) {
                continue;
            }

            DB::table('admins')->insert([
                'name'            => $user->name,
                'email'           => $user->email,
                'password'        => $user->password,
                'remember_token'  => $user->remember_token,
                'created_at'      => $user->created_at,
                'updated_at'      => $user->updated_at,
            ]);
        }
    }

    public function down(): void
    {
        // No-op: reversing this would risk deleting admin accounts created after the migration.
    }
};
