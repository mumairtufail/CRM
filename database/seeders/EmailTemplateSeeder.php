<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name'            => 'Modern Purple',
                'description'     => 'Clean purple gradient header with dark footer. Matches your CRM theme.',
                'thumbnail_color' => '#7c3aed',
                'html_content'    => self::modernPurple(),
            ],
            [
                'name'            => 'Clean Minimal',
                'description'     => 'Pure white layout with a subtle accent line. Professional and distraction-free.',
                'thumbnail_color' => '#6366f1',
                'html_content'    => self::cleanMinimal(),
            ],
            [
                'name'            => 'Dark Pro',
                'description'     => 'Full dark theme with purple accents. Great for tech and SaaS audiences.',
                'thumbnail_color' => '#0f172a',
                'html_content'    => self::darkPro(),
            ],
        ];

        foreach ($templates as $data) {
            EmailTemplate::firstOrCreate(
                ['name' => $data['name'], 'is_system' => true],
                [...$data, 'is_system' => true, 'user_id' => null]
            );
        }
    }

    private static function modernPurple(): string
    {
        return <<<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Email</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f0effe;-webkit-font-smoothing:antialiased}
.outer{padding:32px 16px}
.card{max-width:600px;margin:0 auto;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(124,58,237,0.12)}
.header{background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);padding:36px 40px}
.header-logo{color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px}
.header-sub{color:rgba(255,255,255,0.65);font-size:13px;margin-top:5px}
.body{background:#fff;padding:40px}
.body h1,.body h2,.body h3{color:#1e1b4b;line-height:1.3;margin-bottom:14px}
.body h1{font-size:24px;font-weight:700}
.body h2{font-size:20px;font-weight:600}
.body h3{font-size:16px;font-weight:600}
.body p{color:#4b5563;line-height:1.75;font-size:15px;margin-bottom:16px}
.body a{color:#7c3aed;text-decoration:underline}
.body ul,.body ol{color:#4b5563;padding-left:20px;margin-bottom:16px}
.body li{line-height:1.75;font-size:15px}
.body strong{color:#374151}
.footer{background:#1e1b4b;padding:24px 40px;text-align:center}
.footer p{color:rgba(255,255,255,0.4);font-size:12px;line-height:1.7}
.footer a{color:rgba(255,255,255,0.55);text-decoration:underline}
.footer .brand{color:rgba(255,255,255,0.65);font-weight:600;font-size:13px;margin-bottom:6px}
@media(max-width:600px){.outer{padding:16px 8px}.header,.body,.footer{padding:24px 20px}}
</style>
</head>
<body>
<div class="outer">
  <div class="card">
    <div class="header">
      <div class="header-logo">{{company_name}}</div>
      <div class="header-sub">{{from_name}}</div>
    </div>
    <div class="body">
      {{content}}
    </div>
    <div class="footer">
      <p class="brand">{{company_name}}</p>
      <p>You received this email because you're on our mailing list.<br>
      <a href="#">Unsubscribe</a> &nbsp;&middot;&nbsp; <a href="#">Privacy Policy</a></p>
      <p style="margin-top:8px">&copy; {{year}} {{company_name}}. All rights reserved.</p>
    </div>
  </div>
</div>
</body>
</html>
HTML;
    }

    private static function cleanMinimal(): string
    {
        return <<<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Email</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8f8fc;-webkit-font-smoothing:antialiased}
.outer{padding:32px 16px}
.card{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06)}
.accent-bar{height:4px;background:linear-gradient(90deg,#7c3aed,#6366f1)}
.header{padding:28px 40px 20px;border-bottom:1px solid #f1f0f8}
.header-logo{color:#1e1b4b;font-size:18px;font-weight:700;letter-spacing:-0.3px}
.header-from{color:#9ca3af;font-size:12px;margin-top:3px}
.body{padding:36px 40px}
.body h1,.body h2,.body h3{color:#111827;line-height:1.3;margin-bottom:14px}
.body h1{font-size:22px;font-weight:700}
.body h2{font-size:18px;font-weight:600}
.body h3{font-size:15px;font-weight:600}
.body p{color:#4b5563;line-height:1.75;font-size:15px;margin-bottom:16px}
.body a{color:#7c3aed;text-decoration:underline}
.body ul,.body ol{color:#4b5563;padding-left:20px;margin-bottom:16px}
.body li{line-height:1.75;font-size:15px}
.body strong{color:#111827}
.footer{padding:20px 40px 28px;border-top:1px solid #f1f0f8;text-align:center}
.footer p{color:#9ca3af;font-size:11.5px;line-height:1.7}
.footer a{color:#7c3aed;text-decoration:none}
@media(max-width:600px){.outer{padding:16px 8px}.header,.body,.footer{padding:20px}}
</style>
</head>
<body>
<div class="outer">
  <div class="card">
    <div class="accent-bar"></div>
    <div class="header">
      <div class="header-logo">{{company_name}}</div>
      <div class="header-from">From {{from_name}}</div>
    </div>
    <div class="body">
      {{content}}
    </div>
    <div class="footer">
      <p>Sent by <strong>{{company_name}}</strong> &middot; <a href="#">Unsubscribe</a> &middot; <a href="#">Privacy</a></p>
      <p style="margin-top:4px">&copy; {{year}} {{company_name}}</p>
    </div>
  </div>
</div>
</body>
</html>
HTML;
    }

    private static function darkPro(): string
    {
        return <<<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Email</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#080b14;-webkit-font-smoothing:antialiased}
.outer{padding:32px 16px}
.card{max-width:600px;margin:0 auto;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06)}
.header{background:#0d1117;padding:32px 40px;border-bottom:1px solid rgba(124,58,237,0.25)}
.header-logo{color:#e2e8f0;font-size:20px;font-weight:700;letter-spacing:-0.3px}
.header-logo span{color:#a78bfa}
.header-from{color:#6b7280;font-size:12px;margin-top:4px}
.body{background:#0d1117;padding:40px}
.body h1,.body h2,.body h3{color:#f1f5f9;line-height:1.3;margin-bottom:14px}
.body h1{font-size:22px;font-weight:700}
.body h2{font-size:18px;font-weight:600}
.body h3{font-size:15px;font-weight:600}
.body p{color:#94a3b8;line-height:1.75;font-size:15px;margin-bottom:16px}
.body a{color:#a78bfa;text-decoration:underline}
.body ul,.body ol{color:#94a3b8;padding-left:20px;margin-bottom:16px}
.body li{line-height:1.75;font-size:15px}
.body strong{color:#e2e8f0}
.divider{height:1px;background:rgba(255,255,255,0.06);margin:24px 0}
.footer{background:#080b14;padding:24px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.05)}
.footer p{color:rgba(255,255,255,0.25);font-size:11.5px;line-height:1.7}
.footer a{color:rgba(167,139,250,0.6);text-decoration:none}
@media(max-width:600px){.outer{padding:16px 8px}.header,.body,.footer{padding:24px 20px}}
</style>
</head>
<body>
<div class="outer">
  <div class="card">
    <div class="header">
      <div class="header-logo">{{company_name}}</div>
      <div class="header-from">{{from_name}}</div>
    </div>
    <div class="body">
      {{content}}
    </div>
    <div class="footer">
      <p>{{company_name}} &middot; <a href="#">Unsubscribe</a> &middot; <a href="#">Privacy Policy</a></p>
      <p style="margin-top:4px">&copy; {{year}} {{company_name}}. All rights reserved.</p>
    </div>
  </div>
</div>
</body>
</html>
HTML;
    }
}
