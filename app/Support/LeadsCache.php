<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

class LeadsCache
{
    /**
     * Bump the leads index cache version for an organization, forcing the next
     * `/leads` request to rebuild its cached payload instead of reusing a stale one.
     *
     * Cache::increment() is a no-op on the database cache driver when the key has
     * never been written before (it returns false rather than creating the row),
     * so we seed it with Cache::add() first to guarantee the increment takes effect.
     */
    public static function bust(?int $orgId): void
    {
        if (!$orgId) {
            return;
        }

        $key = "leads_v:{$orgId}";
        Cache::add($key, 1);
        Cache::increment($key);
    }
}
