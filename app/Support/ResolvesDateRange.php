<?php

namespace App\Support;

use Carbon\Carbon;
use Illuminate\Http\Request;

trait ResolvesDateRange
{
    /**
     * @return array{0: string, 1: Carbon, 2: Carbon}
     */
    private function resolveRange(Request $request): array
    {
        $range = $request->input('range', '30d');

        try {
            [$from, $to] = match ($range) {
                'today'      => [now()->startOfDay(), now()->endOfDay()],
                '7d'         => [now()->subDays(7), now()],
                '30d'        => [now()->subDays(30), now()],
                '90d'        => [now()->subDays(90), now()],
                'this_month' => [now()->startOfMonth(), now()->endOfDay()],
                'last_month' => [now()->subMonthNoOverflow()->startOfMonth(), now()->subMonthNoOverflow()->endOfMonth()],
                'custom'     => [
                    $request->filled('from') ? Carbon::parse($request->input('from'))->startOfDay() : now()->subDays(30),
                    $request->filled('to') ? Carbon::parse($request->input('to'))->endOfDay() : now(),
                ],
                default      => [now()->subDays(30), now()],
            };
        } catch (\Throwable) {
            $range = '30d';
            [$from, $to] = [now()->subDays(30), now()];
        }

        return [$range, $from, $to];
    }

    /**
     * The immediately-preceding period of equal length, for period-over-period
     * comparisons (e.g. "leads this range" vs "leads in the same-length range before it").
     *
     * @return array{0: Carbon, 1: Carbon}
     */
    private function precedingRange(Carbon $from, Carbon $to): array
    {
        $length = $from->diffInSeconds($to);

        return [$from->copy()->subSeconds($length), $from->copy()];
    }
}
