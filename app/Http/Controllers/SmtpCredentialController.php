<?php

namespace App\Http\Controllers;

use App\Models\SmtpCredential;
use App\Services\MailService;
use Illuminate\Http\Request;

class SmtpCredentialController extends Controller
{
    private function owned(Request $request, SmtpCredential $cred): void
    {
        abort_unless($cred->user_id === $request->user()->id, 403);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:100',
            'host'       => 'required|string|max:255',
            'port'       => 'required|integer|min:1|max:65535',
            'encryption' => 'required|in:tls,ssl,none',
            'username'   => 'required|string|max:255',
            'password'   => 'required|string|max:1000',
            'from_name'  => 'required|string|max:100',
            'from_email' => 'required|email|max:200',
        ]);

        $request->user()->smtpCredentials()->create($data);

        return back()->with('smtp_success', 'SMTP account added.');
    }

    public function update(Request $request, SmtpCredential $smtpCredential)
    {
        $this->owned($request, $smtpCredential);

        $data = $request->validate([
            'name'       => 'required|string|max:100',
            'host'       => 'required|string|max:255',
            'port'       => 'required|integer|min:1|max:65535',
            'encryption' => 'required|in:tls,ssl,none',
            'username'   => 'required|string|max:255',
            'password'   => 'nullable|string|max:1000',
            'from_name'  => 'required|string|max:100',
            'from_email' => 'required|email|max:200',
        ]);

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $smtpCredential->update($data);

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
