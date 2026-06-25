<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;
use Symfony\Component\Mailer\Mailer as SymfonyMailer;
use Symfony\Component\Mime\Email;

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
            $port       = (int) ($smtp['port'] ?? 587);

            $transport = new EsmtpTransport(
                $smtp['host'],
                $port,
                $encryption === 'ssl'
            );

            if ($encryption === 'tls') {
                $transport->setTlsOptions([
                    'verify_peer'      => false,
                    'verify_peer_name' => false,
                ]);
            }

            $transport->setUsername($smtp['username']);
            $transport->setPassword($smtp['password'] ?? '');

            $mailer = new SymfonyMailer($transport);

            $email = (new Email())
                ->from(sprintf('%s <%s>', $smtp['from_name'] ?? 'Platform', $smtp['from_email']))
                ->to($request->user()->email)
                ->subject('Platform SMTP Test')
                ->text('This is a test email from your CRM platform SMTP configuration. If you received this, the settings are working correctly.');

            $mailer->send($email);

            return response()->json([
                'ok'      => true,
                'message' => 'Test email sent to ' . $request->user()->email,
            ]);
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'message' => $e->getMessage()], 422);
        }
    }
}
