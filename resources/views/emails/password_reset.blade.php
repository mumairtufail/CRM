@extends('emails.layout')
@section('content')

  <p class="greeting">Reset your password</p>

  <p class="body-text">
    We received a request to reset the password for your account.
    Click the button below to choose a new password. This link will expire in
    {{ config('auth.passwords.'.config('auth.defaults.passwords').'.expire') }} minutes.
  </p>

  <div class="btn-wrap">
    <a href="{{ $url }}" class="btn">Reset Password</a>
  </div>

  <hr class="divider" />

  <p class="body-text" style="font-size:13px; color:#8b80c8;">
    If you didn't request a password reset, no action is needed — your password will
    remain unchanged. If you're having trouble clicking the button, copy and paste the
    URL below into your browser:
  </p>
  <p style="font-size:12px; color:#a79fd8; word-break:break-all; margin-top:8px;">
    {{ $url }}
  </p>

@endsection
