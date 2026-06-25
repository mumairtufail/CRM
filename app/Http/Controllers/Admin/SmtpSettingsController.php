<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class SmtpSettingsController extends Controller
{
    public function edit()
    {
        $smtp = SystemSetting::getSmtp();

        return Inertia::render('Admin/SmtpSettings', [
            'smtp'        => $smtp,
            'configured'  => SystemSetting::isSmtpConfigured(),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'host'       => 'required|string|max:255',
            'port'       => 'required|integer|min:1|max:65535',
            'encryption' => 'required|in:tls,ssl,none',
            'username'   => 'required|string|max:255',
            'password'   => 'nullable|string|max:1000',
            'from_name'  => 'required|string|max:100',
            'from_email' => 'required|email|max:200',
        ]);

        // Keep existing password if not provided
        if (empty($data['password'])) {
            unset($data['password']);
        }

        SystemSetting::saveSmtp($data);

        return back()->with('success', 'SMTP settings saved successfully.');
    }

    public function test(Request $request)
    {
        $smtp = SystemSetting::getSmtp();

        if (empty($smtp['host']) || empty($smtp['username'])) {
            return response()->json(['ok' => false, 'message' => 'SMTP is not configured yet.'], 422);
        }

        try {
            $encryption = $smtp['encryption'] ?? 'tls';

            config([
                'mail.mailers.smtp_test' => [
                    'transport'  => 'smtp',
                    'host'       => $smtp['host'],
                    'port'       => (int) ($smtp['port'] ?? 587),
                    'encryption' => $encryption === 'none' ? null : $encryption,
                    'username'   => $smtp['username'],
                    'password'   => $smtp['password'] ?? '',
                    'timeout'    => 15,
                ],
            ]);

            Mail::mailer('smtp_test')
                ->raw(
                    'This is a test email from your CRM platform SMTP configuration. If you received this, your settings are working correctly.',
                    function ($message) use ($smtp, $request) {
                        $message
                            ->from($smtp['from_email'], $smtp['from_name'] ?? 'Platform')
                            ->to($request->user()->email)
                            ->subject('Platform SMTP Test');
                    }
                );

            return response()->json([
                'ok'      => true,
                'message' => 'Test email sent to ' . $request->user()->email,
            ]);
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'message' => $e->getMessage()], 422);
        }
    }
}
