<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Email Address</title>
    <style>
        body {
            background-color: #F4F2FF;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #334155;
        }
        .email-wrapper {
            width: 100%;
            padding: 40px 0;
            background-color: #F4F2FF;
        }
        .email-container {
            max-width: 500px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid rgba(0, 0, 0, 0.05);
            border-radius: 16px;
            padding: 40px 32px;
            box-shadow: 0 10px 30px -10px rgba(124, 58, 237, 0.04);
            text-align: center;
        }
        .logo-wrapper {
            margin-bottom: 24px;
            display: inline-block;
        }
        .logo-img {
            max-width: 48px;
            height: 48px;
            display: block;
            margin: 0 auto;
            border-radius: 10px;
        }
        .email-title {
            font-size: 21px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 0;
            margin-bottom: 8px;
            letter-spacing: -0.4px;
        }
        .email-subtitle {
            font-size: 13.5px;
            color: #64748b;
            margin-top: 0;
            margin-bottom: 24px;
            line-height: 1.4;
        }
        .email-text {
            font-size: 13.5px;
            color: #475569;
            line-height: 1.6;
            margin-bottom: 24px;
            text-align: left;
        }
        .btn-wrapper {
            margin-top: 28px;
            margin-bottom: 28px;
            text-align: center;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
            background-color: #7c3aed;
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 600;
            font-size: 13.5px;
            padding: 12px 28px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
        }
        .divider {
            border: 0;
            border-top: 1px solid #f1f5f9;
            margin: 24px 0;
        }
        .footer-text {
            font-size: 11px;
            color: #94a3b8;
            line-height: 1.5;
            text-align: center;
        }
        .btn-trouble {
            font-size: 11px;
            color: #94a3b8;
            line-height: 1.5;
            text-align: left;
            word-break: break-all;
        }
        .link-trouble {
            color: #7c3aed;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            @php
                $logoUrl = \App\Models\SystemSetting::get('custom_logo_url');
                $logoSrc = $logoUrl ? asset($logoUrl) : asset('favicon.svg');
            @endphp
            <div class="logo-wrapper">
                <img src="{{ $logoSrc }}" alt="LumeniaCRM Logo" class="logo-img" width="48" height="48">
            </div>

            <h1 class="email-title">Verify your email address</h1>
            <p class="email-subtitle">Welcome to LumeniaCRM! We're excited to have you.</p>

            <p class="email-text">
                Hi {{ $user->name }},<br><br>
                Thank you for signing up. Please click the button below to verify your email address and activate your organization workspace:
            </p>

            <div class="btn-wrapper">
                <a href="{{ $url }}" class="btn">Verify Email Address</a>
            </div>

            <p class="email-text" style="font-size: 12.5px; color: #64748b; margin-bottom: 0;">
                If you did not register for an account, no further action is required.
            </p>

            <hr class="divider">

            <p class="btn-trouble">
                If you're having trouble clicking the "Verify Email Address" button, copy and paste the URL below into your web browser:<br>
                <a href="{{ $url }}" class="link-trouble">{{ $url }}</a>
            </p>

            <p class="footer-text" style="margin-top: 24px;">
                &copy; {{ date('Y') }} LumeniaCRM. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
