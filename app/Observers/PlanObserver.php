<?php

namespace App\Observers;

use App\Models\Plan;

class PlanObserver
{
    public function saved(Plan $plan): void
    {
        Plan::forgetModuleCache($plan->id);
    }

    public function deleted(Plan $plan): void
    {
        Plan::forgetModuleCache($plan->id);
    }
}
