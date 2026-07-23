<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request as RequestFacade;

class ActivityLogger
{
    /**
     * Record an activity log entry. Causer, IP, and user agent are pulled from
     * the current request/auth context unless explicitly overridden.
     *
     * @param  string       $action       Dot-namespaced action slug, e.g. "lead.updated".
     * @param  Model|null   $subject      The model the action was performed on, if any.
     * @param  array        $properties   Extra context (e.g. changed fields, before/after).
     * @param  string|null  $description  Optional human-readable summary.
     */
    public static function log(
        string $action,
        ?Model $subject = null,
        array $properties = [],
        ?string $description = null,
        ?User $causer = null,
    ): ActivityLog {
        $causer ??= Auth::user();

        return ActivityLog::create([
            'organization_id' => $causer?->organization_id,
            'causer_id'       => $causer?->id,
            'causer_name'     => $causer?->name,
            'action'          => $action,
            'description'     => $description,
            'subject_type'    => $subject?->getMorphClass(),
            'subject_id'      => $subject?->getKey(),
            'properties'      => $properties ?: null,
            'ip_address'      => RequestFacade::ip(),
            'user_agent'      => substr((string) RequestFacade::userAgent(), 0, 512),
        ]);
    }
}
