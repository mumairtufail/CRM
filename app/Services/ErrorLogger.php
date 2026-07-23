<?php

namespace App\Services;

use App\Models\ErrorLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request as RequestFacade;
use Throwable;

class ErrorLogger
{
    /**
     * Exception classes that represent expected control flow (validation
     * failures, 404s, auth redirects) rather than bugs — not worth persisting.
     */
    private const IGNORED_CLASSES = [
        \Illuminate\Validation\ValidationException::class,
        \Illuminate\Auth\AuthenticationException::class,
        \Illuminate\Auth\Access\AuthorizationException::class,
        \Illuminate\Database\Eloquent\ModelNotFoundException::class,
        \Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
        \Symfony\Component\HttpKernel\Exception\HttpException::class,
        \Illuminate\Session\TokenMismatchException::class,
    ];

    public static function reportException(Throwable $e): void
    {
        foreach (self::IGNORED_CLASSES as $ignored) {
            if ($e instanceof $ignored) {
                return;
            }
        }

        // Never let logging itself take down the request that triggered it.
        try {
            $user = Auth::guard('web')->user();

            ErrorLog::create([
                'source'          => 'backend',
                'message'         => substr($e->getMessage(), 0, 1000),
                'exception_class' => get_class($e),
                'file'            => $e->getFile(),
                'line'            => $e->getLine(),
                'trace'           => substr($e->getTraceAsString(), 0, 20000),
                'url'             => RequestFacade::fullUrl(),
                'organization_id' => $user?->organization_id,
                'causer_id'       => $user?->id,
                'causer_name'     => $user?->name,
                'ip_address'      => RequestFacade::ip(),
                'user_agent'      => substr((string) RequestFacade::userAgent(), 0, 512),
            ]);
        } catch (Throwable $loggingFailure) {
            Log::error('ErrorLogger failed to persist exception: ' . $loggingFailure->getMessage());
        }
    }

    public static function reportFrontend(array $payload): void
    {
        try {
            $user = Auth::guard('web')->user();

            ErrorLog::create([
                'source'          => 'frontend',
                'message'         => substr((string) ($payload['message'] ?? 'Unknown frontend error'), 0, 1000),
                'file'            => $payload['file'] ?? null,
                'line'            => $payload['line'] ?? null,
                'trace'           => substr((string) ($payload['stack'] ?? ''), 0, 20000) ?: null,
                'url'             => $payload['url'] ?? RequestFacade::fullUrl(),
                'organization_id' => $user?->organization_id,
                'causer_id'       => $user?->id,
                'causer_name'     => $user?->name,
                'ip_address'      => RequestFacade::ip(),
                'user_agent'      => substr((string) RequestFacade::userAgent(), 0, 512),
                'context'         => $payload['context'] ?? null,
            ]);
        } catch (Throwable $loggingFailure) {
            Log::error('ErrorLogger failed to persist frontend error: ' . $loggingFailure->getMessage());
        }
    }
}
