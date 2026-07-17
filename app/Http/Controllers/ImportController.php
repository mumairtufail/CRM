<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ImportJob;
use App\Models\Lead;
use App\Models\LeadEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ImportController extends Controller
{
    public function index(Request $request)
    {
        $job = null;
        if ($id = $request->input('job')) {
            $job = ImportJob::find($id);
        }

        return Inertia::render('Import', ['importJob' => $job]);
    }

    // ── CSV upload ────────────────────────────────────────────────────────────

    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

        $path     = $request->file('file')->store('imports');
        $fullPath = Storage::path($path);

        [$headers, $rows] = $this->parseCsvFile($fullPath);

        $job = ImportJob::create([
            'source'        => 'csv',
            'status'        => 'preview',
            'preview_data'  => $rows,
            'total_rows'    => count($rows),
            'file_path'     => $path,
            'duplicate_map' => $this->findDuplicateEmailMap($request->user()->organization_id, $rows),
        ]);

        return redirect()->route('import.index', ['job' => $job->id]);
    }

    // ── Google Sheets: fetch sheet names ──────────────────────────────────────

    public function fetchSheets(Request $request)
    {
        $request->validate(['url' => 'required|string']);
        $url = trim($request->input('url'));

        if (!preg_match('/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/', $url, $matches)) {
            return response()->json(['error' => 'Invalid Google Sheets URL. Copy the full URL from your browser address bar.'], 422);
        }

        $spreadsheetId = $matches[1];

        try {
            // Verify access by fetching a tiny slice of the first sheet via gviz (same endpoint used for the real import).
            // Google's old Feeds API v3 was shut down in 2021 and always returns 404, so we skip it entirely.
            $probeUrl = "https://docs.google.com/spreadsheets/d/{$spreadsheetId}/gviz/tq?tqx=out:csv&range=A1:A2";
            $response = Http::timeout(10)->get($probeUrl);

            Log::info('fetchSheets probe', ['status' => $response->status(), 'id' => $spreadsheetId]);

            if ($response->status() === 401 || $response->status() === 403) {
                return response()->json([
                    'error' => 'Access denied (HTTP ' . $response->status() . '). Open the sheet → Share → set to "Anyone with the link can view".',
                ], 422);
            }

            if (!$response->ok()) {
                return response()->json([
                    'error' => 'Could not reach this spreadsheet (HTTP ' . $response->status() . '). Double-check the URL and sharing settings.',
                ], 422);
            }

            // Sheet is accessible. We don't have a Sheets API key, but the public "view"
            // page renders each tab as a `docs-sheet-tab-caption` element — scrape those
            // to get the real tab names instead of guessing "Sheet1".
            $sheetNames = $this->scrapeSheetTabNames($spreadsheetId);

            return response()->json([
                'spreadsheet_id' => $spreadsheetId,
                'verified'       => true,
                'sheets'         => $sheetNames ?: ['Sheet1'],
                'guessed'        => empty($sheetNames),
                'warning'        => empty($sheetNames)
                    ? 'Could not automatically detect tab names — enter the exact tab name shown at the bottom of your Google Sheet.'
                    : null,
            ]);

        } catch (\Throwable $e) {
            Log::error('fetchSheets exception', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Connection error: ' . $e->getMessage()], 422);
        }
    }

    // ── Google Sheets: scrape real tab names from the public view page ────────

    private function scrapeSheetTabNames(string $spreadsheetId): array
    {
        try {
            $response = Http::timeout(10)->get("https://docs.google.com/spreadsheets/d/{$spreadsheetId}/edit");

            if (!$response->ok()) {
                return [];
            }

            // Match the caption div regardless of other classes Google adds
            // (e.g. the active tab gets an extra "docs-sheet-active-tab" class).
            preg_match_all(
                '/<div class="[^"]*\bdocs-sheet-tab-caption\b[^"]*">([^<]*)<\/div>/',
                $response->body(),
                $matches
            );

            $names = array_map(
                fn ($name) => html_entity_decode(trim($name), ENT_QUOTES),
                $matches[1] ?? []
            );

            return array_values(array_filter($names, fn ($name) => $name !== ''));
        } catch (\Throwable $e) {
            Log::warning('scrapeSheetTabNames failed', ['message' => $e->getMessage()]);
            return [];
        }
    }

    // ── Google Sheets: download selected sheet as CSV & create ImportJob ──────

    public function uploadFromSheets(Request $request)
    {
        $request->validate([
            'spreadsheet_id' => 'required|string',
            'sheet'          => 'required|string',
        ]);

        $id    = $request->input('spreadsheet_id');
        $sheet = $request->input('sheet');

        $csvUrl = "https://docs.google.com/spreadsheets/d/{$id}/gviz/tq?tqx=out:csv&sheet=" . urlencode($sheet);
        Log::channel('import')->info('uploadFromSheets: start', [
            'spreadsheet_id' => $id,
            'sheet'          => $sheet,
            'csv_url'        => $csvUrl,
        ]);

        try {
            $response = Http::timeout(15)->get($csvUrl);

            Log::channel('import')->info('uploadFromSheets: gviz response', [
                'status'      => $response->status(),
                'ok'          => $response->ok(),
                'body_length' => strlen($response->body()),
                'body_head'   => substr($response->body(), 0, 300),
            ]);

            if (!$response->ok()) {
                Log::channel('import')->warning('uploadFromSheets: gviz non-OK', ['status' => $response->status()]);
                return back()->withErrors(['url' => 'Could not access the spreadsheet. Make sure it is shared publicly (Anyone with the link can view).']);
            }

            $tmpPath = tempnam(sys_get_temp_dir(), 'gsheet_');
            file_put_contents($tmpPath, $response->body());

            [$headers, $rows] = $this->parseCsvFile($tmpPath);
            unlink($tmpPath);

            Log::channel('import')->info('uploadFromSheets: parsed CSV', [
                'headers'   => $headers,
                'row_count' => count($rows),
            ]);

            if (empty($headers)) {
                Log::channel('import')->warning('uploadFromSheets: empty sheet returned');
                return back()->withErrors(['sheet' => 'The selected sheet appears to be empty or could not be read.']);
            }

            $job = ImportJob::create([
                'source'        => 'google_sheet',
                'status'        => 'preview',
                'preview_data'  => $rows,
                'total_rows'    => count($rows),
                'duplicate_map' => $this->findDuplicateEmailMap($request->user()->organization_id, $rows),
            ]);

            Log::channel('import')->info('uploadFromSheets: job created', ['job_id' => $job->id]);

            return redirect()->route('import.index', ['job' => $job->id]);

        } catch (\Throwable $e) {
            Log::channel('import')->error('uploadFromSheets: exception', [
                'message' => $e->getMessage(),
                'class'   => get_class($e),
                'trace'   => $e->getTraceAsString(),
            ]);
            return back()->withErrors(['url' => 'Import failed. Please check the URL and ensure the sheet is shared publicly.']);
        }
    }

    // ── Confirm import ────────────────────────────────────────────────────────

    public function confirm(Request $request, ImportJob $job)
    {
        if ($job->status !== 'preview') {
            return redirect()->route('import.index');
        }

        $rows        = $job->preview_data ?? [];
        $duplicates  = $job->duplicate_map ?? [];
        $resolutions = $request->input('resolutions', []);
        $imported    = 0;
        $updated     = 0;
        $skipped     = 0;
        $errors      = [];
        $source      = $job->source ?? 'csv';
        $sourceLabel = $source === 'google_sheet' ? 'Google Sheets' : 'CSV';

        foreach ($rows as $i => $row) {
            $firstName = trim($row['first_name'] ?? $row['First Name'] ?? $row['firstname'] ?? '');
            $dup       = $duplicates[$i] ?? null;
            $action    = $dup ? ($resolutions[$i] ?? 'skip') : 'create';

            if ($dup && $action === 'skip') {
                $skipped++;
                $errors[] = "Row {$i}: duplicate email ({$dup['email']}) — kept existing lead #{$dup['lead_id']}";
                continue;
            }

            try {
                // Build social_handles JSON from flat social columns
                $socialHandles = [];
                foreach (['twitter', 'instagram', 'facebook', 'tiktok', 'youtube'] as $platform) {
                    $url = trim($row[$platform] ?? $row[ucfirst($platform)] ?? '');
                    if ($url !== '') {
                        $socialHandles[] = ['platform' => $platform, 'url' => $url];
                    }
                }

                $attributes = [
                    'first_name'     => $firstName,
                    'last_name'      => $row['last_name']    ?? $row['Last Name']    ?? $row['lastname']   ?? null,
                    'company'        => $row['company']      ?? $row['Company']      ?? null,
                    'job_title'      => $row['job_title']    ?? $row['Job Title']    ?? $row['title']      ?? null,
                    'website'        => $row['website']      ?? $row['Website']      ?? null,
                    'linkedin_url'   => $row['linkedin_url'] ?? $row['linkedin']     ?? $row['LinkedIn']   ?? null,
                    'country'        => $row['country']      ?? $row['Country']      ?? null,
                    'city'           => $row['city']         ?? $row['City']         ?? null,
                    'industry'       => $row['industry']     ?? $row['Industry']     ?? null,
                    'notes'          => $row['notes']        ?? $row['Notes']        ?? null,
                    'deal_value'     => is_numeric($row['deal_value'] ?? $row['Deal Value'] ?? '') ? ($row['deal_value'] ?? $row['Deal Value']) : null,
                    'currency'       => strtoupper($row['currency'] ?? $row['Currency'] ?? 'USD'),
                    'status'         => $row['status']       ?? $row['Status']       ?? 'new',
                    'priority'       => $row['priority']     ?? $row['Priority']     ?? 'medium',
                    'social_handles' => empty($socialHandles) ? null : $socialHandles,
                    'source'         => $source,
                ];

                $email = $row['email'] ?? $row['Email'] ?? $row['email_address'] ?? null;
                $phone = $row['phone'] ?? $row['Phone'] ?? $row['phone_number']  ?? null;

                if ($dup && $action === 'replace') {
                    $lead = Lead::findOrFail($dup['lead_id']);
                    $lead->fill($attributes);
                    $lead->save();

                    if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                        $lead->emails()->updateOrCreate(
                            ['email' => $email],
                            ['type' => 'work', 'is_primary' => true]
                        );
                    }
                    if ($phone) {
                        $lead->phones()->updateOrCreate(
                            ['phone' => $phone],
                            ['type' => 'mobile', 'is_primary' => true]
                        );
                    }

                    Activity::create([
                        'lead_id'     => $lead->id,
                        'user_id'     => auth()->id(),
                        'type'        => 'import',
                        'description' => "Updated via {$sourceLabel} (duplicate email replaced)",
                    ]);

                    $updated++;
                    continue;
                }

                $lead = Lead::create($attributes + ['created_by' => auth()->id()]);

                if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $lead->emails()->create(['email' => $email, 'type' => 'work', 'is_primary' => true]);
                }
                if ($phone) {
                    $lead->phones()->create(['phone' => $phone, 'type' => 'mobile', 'is_primary' => true]);
                }

                Activity::create([
                    'lead_id'     => $lead->id,
                    'user_id'     => auth()->id(),
                    'type'        => 'import',
                    'description' => "Imported via {$sourceLabel}",
                ]);

                $imported++;
            } catch (\Throwable $e) {
                $skipped++;
                $errors[] = "Row {$i}: " . $e->getMessage();
            }
        }

        $job->update([
            'status'        => 'completed',
            'imported_rows' => $imported,
            'updated_rows'  => $updated,
            'skipped_rows'  => $skipped,
            'errors'        => $errors,
        ]);

        return redirect()->route('import.index', ['job' => $job->id]);
    }

    // ── Cancel / delete pending import job ────────────────────────────────────

    public function cancel(ImportJob $job)
    {
        $job->delete();
        return redirect()->route('import.index');
    }

    // ── Duplicate email detection ────────────────────────────────────────────
    // Batches the lookup (one query) instead of hitting the DB per row, since
    // an upload can contain up to 500 rows.

    private function findDuplicateEmailMap(int $organizationId, array $rows): array
    {
        $emails = collect($rows)
            ->map(fn ($row) => $this->extractField($row, ['email', 'Email', 'email_address']))
            ->filter()
            ->map(fn ($e) => strtolower($e))
            ->unique();

        if ($emails->isEmpty()) {
            return [];
        }

        $matches = LeadEmail::whereIn(DB::raw('LOWER(email)'), $emails)
            ->whereHas('lead', fn ($q) => $q->where('organization_id', $organizationId))
            ->with('lead')
            ->get()
            ->keyBy(fn ($leadEmail) => strtolower($leadEmail->email));

        $map = [];
        foreach ($rows as $i => $row) {
            $email = $this->extractField($row, ['email', 'Email', 'email_address']);
            if (!$email) {
                continue;
            }

            $match = $matches->get(strtolower($email));
            if ($match) {
                $map[$i] = [
                    'lead_id' => $match->lead->id,
                    'name'    => $match->lead->full_name,
                    'company' => $match->lead->company,
                    'email'   => $match->email,
                    'phone'   => $match->lead->primary_phone,
                ];
            }
        }

        return $map;
    }

    private function extractField(array $row, array $keys): ?string
    {
        foreach ($keys as $key) {
            if (!empty($row[$key])) {
                return trim($row[$key]);
            }
        }

        return null;
    }

    // ── Shared CSV parser ─────────────────────────────────────────────────────

    private function parseCsvFile(string $path): array
    {
        $handle     = fopen($path, 'r');
        $rawHeaders = fgetcsv($handle);

        if (!$rawHeaders) {
            fclose($handle);
            return [[], []];
        }

        $headers = array_map('trim', $rawHeaders);
        $rows    = [];

        while (($raw = fgetcsv($handle)) !== false && count($rows) < 500) {
            if (count($raw) === count($headers)) {
                $rows[] = array_combine($headers, array_map('trim', $raw));
            }
        }

        fclose($handle);
        return [$headers, $rows];
    }
}
