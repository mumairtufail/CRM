<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

/**
 * Blocks executable/script file types from being attached to outgoing email —
 * mail providers reject or flag most of these anyway, and it keeps the
 * `public` disk (which serves uploaded files directly) from ever hosting
 * something runnable.
 */
class SafeAttachment implements ValidationRule
{
    private const BLOCKED_EXTENSIONS = [
        'exe', 'bat', 'cmd', 'com', 'msi', 'scr', 'vbs', 'vbe', 'js', 'jse',
        'ps1', 'psm1', 'jar', 'app', 'apk', 'sh', 'bash', 'php', 'phtml', 'phar',
    ];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile) {
            return;
        }

        $ext = strtolower($value->getClientOriginalExtension());

        if (in_array($ext, self::BLOCKED_EXTENSIONS, true)) {
            $fail("The :attribute file type (.{$ext}) isn't allowed as an email attachment.");
        }
    }
}
