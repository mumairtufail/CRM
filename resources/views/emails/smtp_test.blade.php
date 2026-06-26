@extends('emails.layout')
@section('content')

  <p class="greeting">SMTP connection verified ✓</p>

  <p class="body-text">
    This email confirms that your platform SMTP configuration is working correctly.
    Outbound emails — including password resets and system notifications — will be
    delivered using these settings.
  </p>

  <div class="info-box">
    <p><strong>Host:</strong> {{ $smtp['host'] }}:{{ $smtp['port'] }}</p>
    <p style="margin-top:6px"><strong>Encryption:</strong> {{ strtoupper($smtp['encryption'] ?? 'TLS') }}</p>
    <p style="margin-top:6px"><strong>Sender:</strong> {{ $smtp['from_name'] }} &lt;{{ $smtp['from_email'] }}&gt;</p>
  </div>

  <hr class="divider" />

  <p class="body-text" style="margin-bottom:0; font-size:13px; color:#8b80c8;">
    If you did not trigger this test, you can safely ignore this email.
    No changes were made to your account.
  </p>

@endsection
