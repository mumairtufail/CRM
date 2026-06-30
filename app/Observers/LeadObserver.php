<?php

namespace App\Observers;

use App\Models\Lead;
use Illuminate\Support\Facades\Cache;

class LeadObserver
{
    public function created(Lead $lead): void { $this->bust($lead->organization_id); }
    public function updated(Lead $lead): void { $this->bust($lead->organization_id); }
    public function deleted(Lead $lead): void { $this->bust($lead->organization_id); }

    private function bust(?int $orgId): void
    {
        if ($orgId) {
            Cache::increment("leads_v:{$orgId}");
        }
    }
}
