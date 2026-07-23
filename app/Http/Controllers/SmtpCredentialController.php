<?php

namespace App\Http\Controllers;

use App\Models\SmtpCredential;
use App\Services\ActivityLogger;
use App\Services\MailService;
use Illuminate\Http\Request;
use Webklex\PHPIMAP\ClientManager;

class SmtpCredentialController extends Controller
{
    private function owned(Request $request, SmtpCredential $cred): void
    {
        abort_unless($cred->user_id === $request->user()->id, 403);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:100',
            'host'            => 'required|string|max:255',
            'port'            => 'required|integer|min:1|max:65535',
            'encryption'      => 'required|in:tls,ssl,none',
            'username'        => 'required|string|max:255',
            'password'        => 'required|string|max:1000',
            'from_name'       => 'required|string|max:100',
            'from_email'      => 'required|email|max:200',
            'imap_host'       => 'nullable|string|max:255',
            'imap_port'       => 'nullable|integer|min:1|max:65535',
            'imap_encryption' => 'nullable|in:ssl,tls,none',
        ]);

        $credential = $request->user()->smtpCredentials()->create($data);

        ActivityLogger::log('smtp.settings_updated', $credential, description: "Added SMTP account {$credential->name}");

        return back()->with('smtp_success', 'SMTP account added.');
    }

    public function update(Request $request, SmtpCredential $smtpCredential)
    {
        $this->owned($request, $smtpCredential);

        $data = $request->validate([
            'name'            => 'required|string|max:100',
            'host'            => 'required|string|max:255',
            'port'            => 'required|integer|min:1|max:65535',
            'encryption'      => 'required|in:tls,ssl,none',
            'username'        => 'required|string|max:255',
            'password'        => 'nullable|string|max:1000',
            'from_name'       => 'required|string|max:100',
            'from_email'      => 'required|email|max:200',
            'imap_host'       => 'nullable|string|max:255',
            'imap_port'       => 'nullable|integer|min:1|max:65535',
            'imap_encryption' => 'nullable|in:ssl,tls,none',
        ]);

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $smtpCredential->update($data);

        ActivityLogger::log('smtp.settings_updated', $smtpCredential, description: "Updated SMTP account {$smtpCredential->name}");

        return back()->with('smtp_success', 'SMTP account updated.');
    }

    public function destroy(Request $request, SmtpCredential $smtpCredential)
    {
        $this->owned($request, $smtpCredential);
        $smtpCredential->delete();

        return back()->with('smtp_success', 'SMTP account removed.');
    }

    public function activate(Request $request, SmtpCredential $smtpCredential)
    {
        $this->owned($request, $smtpCredential);

        $request->user()->smtpCredentials()->update(['is_active' => false]);
        $smtpCredential->update(['is_active' => true]);

        return back()->with('smtp_success', 'SMTP account activated.');
    }

    public function deactivate(Request $request, SmtpCredential $smtpCredential)
    {
        $this->owned($request, $smtpCredential);
        $smtpCredential->update(['is_active' => false]);

        return back()->with('smtp_success', 'SMTP account deactivated.');
    }

    public function test(Request $request, SmtpCredential $smtpCredential)
    {
        $this->owned($request, $smtpCredential);

        try {
            (new MailService($smtpCredential))->sendTest($request->user()->email);
            return response()->json(['ok' => true, 'message' => 'Test email sent to ' . $request->user()->email]);
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function testImap(Request $request, SmtpCredential $smtpCredential)
    {
        $this->owned($request, $smtpCredential);

        if (!$smtpCredential->imap_host) {
            return response()->json(['ok' => false, 'message' => 'IMAP host not configured.'], 422);
        }

        try {
            $cm     = new ClientManager([]);
            $client = $cm->make([
                'host'          => $smtpCredential->imap_host,
                'port'          => $smtpCredential->imap_port    ?? 993,
                'encryption'    => $smtpCredential->imap_encryption ?? 'ssl',
                'validate_cert' => false,
                'username'      => $smtpCredential->username,
                'password'      => $smtpCredential->password,
                'protocol'      => 'imap',
            ]);
            $client->connect();
            $folders = $client->getFolders(false);
            $names   = $folders->map(fn ($f) => $f->name)->implode(', ');
            $client->disconnect();

            return response()->json([
                'ok'      => true,
                'message' => 'IMAP connected. Folders: ' . ($names ?: 'INBOX'),
            ]);
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function updateMailSettings(Request $request)
    {
        $data = $request->validate([
            'mail_batch_size'  => 'required|integer|min:1|max:500',
            'mail_batch_delay' => 'required|integer|min:0|max:300',
        ]);

        $request->user()->update($data);

        return back()->with('smtp_success', 'Mail settings saved.');
    }
}
