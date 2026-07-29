<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: [
            'api/webhooks/twilio/*',
            'api/webhooks/paddle',
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\ResolveTenant::class,
            \App\Http\Middleware\CheckOrganizationExpiry::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'tenant'     => \App\Http\Middleware\ResolveTenant::class,
            'permission' => \App\Http\Middleware\EnsurePermission::class,
            'module'     => \App\Http\Middleware\EnsureModuleAccess::class,
        ]);

        $middleware->redirectGuestsTo(
            fn (Request $request) => $request->is('admin/*') ? route('admin.login') : route('login')
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Persist uncaught exceptions to the DB (see App\Services\ErrorLogger)
        // so the superadmin can review them from /admin/error-log — in addition
        // to Laravel's normal storage/logs/laravel.log output, not instead of it.
        $exceptions->report(function (\Throwable $e) {
            \App\Services\ErrorLogger::reportException($e);
        });

        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Render a styled Inertia page for common HTTP errors (403/404/419/429/503)
        // instead of Laravel's bare-bones default error view. Only 403 passes the
        // real exception message through — those are our own hand-written abort()
        // strings (e.g. the module-gate message); 404/419/429/500/503 messages are
        // framework/internal text (e.g. "No query results for model [...]") that
        // isn't meant for end users, so the frontend falls back to a generic line.
        $exceptions->respond(function (HttpResponse $response, Throwable $exception, Request $request) {
            $status = $response->getStatusCode();

            if ($request->is('api/*') || $request->expectsJson() || ! in_array($status, [403, 404, 419, 429, 500, 503], true)) {
                return $response;
            }

            return Inertia::render('Error', [
                'status'  => $status,
                'message' => $status === 403 ? $exception->getMessage() : null,
            ])->toResponse($request)->setStatusCode($status);
        });
    })->create();
