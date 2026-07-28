<?php

namespace App\Support;

use Illuminate\Http\Request;

class GeoCountry
{
    /**
     * Best-effort ISO 3166-1 alpha-2 country code from whatever reverse proxy/CDN
     * sits in front of the app, checked in priority order. Returns null when none
     * is present — callers must NOT invent a fallback/sentinel country code, since
     * that would get passed straight to Paddle as if it were real geo data. Paddle
     * auto-detects location from the visitor's IP when no address is given.
     */
    public static function fromRequest(Request $request): ?string
    {
        $code = $request->header('CF-IPCountry')
            ?? $request->header('X-Vercel-IP-Country')
            ?? $request->header('X-Country-Code')
            ?? $request->header('X-AppEngine-Country');

        if (!$code || strtolower($code) === 'xx' || !preg_match('/^[A-Za-z]{2}$/', $code)) {
            return null;
        }

        return strtoupper($code);
    }
}
