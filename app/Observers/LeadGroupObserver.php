<?php

namespace App\Observers;

use App\Models\LeadGroup;
use Illuminate\Support\Facades\Cache;

class LeadGroupObserver
{
    public function updated(LeadGroup $group): void { $this->bust($group->organization_id); }
    public function deleted(LeadGroup $group): void { $this->bust($group->organization_id); }

    private function bust(?int $orgId): void
    {
        if ($orgId) {
            Cache::increment("leads_v:{$orgId}");
        }
    }
}
