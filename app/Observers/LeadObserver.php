<?php

namespace App\Observers;

use App\Models\Lead;
use App\Support\LeadsCache;

class LeadObserver
{
    public function created(Lead $lead): void { LeadsCache::bust($lead->organization_id); }
    public function updated(Lead $lead): void { LeadsCache::bust($lead->organization_id); }
    public function deleted(Lead $lead): void { LeadsCache::bust($lead->organization_id); }
}
