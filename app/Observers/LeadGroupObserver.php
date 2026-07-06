<?php

namespace App\Observers;

use App\Models\LeadGroup;
use App\Support\LeadsCache;

class LeadGroupObserver
{
    public function updated(LeadGroup $group): void { LeadsCache::bust($group->organization_id); }
    public function deleted(LeadGroup $group): void { LeadsCache::bust($group->organization_id); }
}
