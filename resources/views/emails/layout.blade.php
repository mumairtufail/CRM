<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{ $subject ?? config('app.name') }}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #F4F2FF;
      color: #1e1b4b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 560px;
      margin: 48px auto;
      padding: 0 16px 48px;
    }
    /* ── Brand header ── */
    .brand {
      text-align: center;
      margin-bottom: 28px;
    }
    .brand-logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #7C3AED, #4F46E5);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-name {
      font-size: 17px;
      font-weight: 800;
      color: #1e1b4b;
      letter-spacing: -0.3px;
    }
    /* ── Card ── */
    .card {
      background: #ffffff;
      border-radius: 20px;
      border: 1px solid #ede9fe;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(109,56,244,0.06);
    }
    .card-accent {
      height: 4px;
      background: linear-gradient(90deg, #7C3AED, #4F46E5, #818CF8);
    }
    .card-body {
      padding: 36px 40px 32px;
    }
    /* ── Typography ── */
    .greeting {
      font-size: 22px;
      font-weight: 700;
      color: #1e1b4b;
      margin-bottom: 12px;
      letter-spacing: -0.3px;
    }
    .body-text {
      font-size: 14.5px;
      line-height: 1.7;
      color: #4c4578;
      margin-bottom: 16px;
    }
    /* ── CTA button ── */
    .btn-wrap {
      text-align: center;
      margin: 28px 0;
    }
    .btn {
      display: inline-block;
      padding: 13px 32px;
      background: linear-gradient(135deg, #7C3AED, #4F46E5);
      color: #ffffff !important;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 10px;
      letter-spacing: 0.1px;
    }
    /* ── Info box ── */
    .info-box {
      background: #f5f3ff;
      border: 1px solid #ede9fe;
      border-radius: 12px;
      padding: 16px 18px;
      margin: 20px 0;
    }
    .info-box p {
      font-size: 13.5px;
      color: #5b21b6;
      line-height: 1.6;
    }
    /* ── Divider ── */
    .divider {
      border: none;
      border-top: 1px solid #f0eeff;
      margin: 24px 0;
    }
    /* ── Footer ── */
    .footer {
      text-align: center;
      margin-top: 28px;
    }
    .footer p {
      font-size: 12px;
      color: #a79fd8;
      line-height: 1.6;
    }
    .footer a {
      color: #7C3AED;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">

    {{-- Brand header --}}
    <div class="brand">
      <span class="brand-logo">
        <span class="brand-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </span>
        <span class="brand-name">{{ config('app.name') }}</span>
      </span>
    </div>

    {{-- Main card --}}
    <div class="card">
      <div class="card-accent"></div>
      <div class="card-body">
        @yield('content')
      </div>
    </div>

    {{-- Footer --}}
    <div class="footer">
      <p>
        You're receiving this email from {{ config('app.name') }}.<br>
        &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>
