<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

/**
 * The three built-in email templates. Custom templates are not supported —
 * these are the only templates available, re-seeded via updateOrCreate.
 *
 * Available placeholders:
 *   {{content}}             — campaign body HTML (required)
 *   {{company_name}}        — workspace company name
 *   {{from_name}}           — sender display name
 *   {{year}}                — current year
 *   {{company_website}}     — workspace website, display form (no protocol)
 *   {{company_website_url}} — workspace website with https:// for href
 *   {{company_phone}}       — workspace phone number
 *   {{company_email}}       — workspace contact email
 */
class EmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name'            => 'Modern Purple',
                'description'     => 'Vibrant gradient header, airy white body, and a built-in signature card.',
                'thumbnail_color' => '#7c3aed',
                'html_content'    => self::modernPurple(),
            ],
            [
                'name'            => 'Clean Minimal',
                'description'     => 'Quiet editorial layout with hairline rules and a classic personal signature.',
                'thumbnail_color' => '#6366f1',
                'html_content'    => self::cleanMinimal(),
            ],
            [
                'name'            => 'Dark Pro',
                'description'     => 'Midnight theme with glowing violet accents and a sleek signature block.',
                'thumbnail_color' => '#0f172a',
                'html_content'    => self::darkPro(),
            ],
        ];

        foreach ($templates as $data) {
            EmailTemplate::updateOrCreate(
                ['name' => $data['name'], 'is_system' => true],
                [...$data, 'is_system' => true, 'user_id' => null, 'organization_id' => null]
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
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>{{company_name}}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f1edff;-webkit-font-smoothing:antialiased;mso-line-height-rule:exactly}
.wrapper{padding:44px 16px}
.card{max-width:600px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 48px rgba(109,40,217,0.16),0 2px 6px rgba(0,0,0,0.05)}
.header{background-color:#6d28d9;background:linear-gradient(135deg,#8b5cf6 0%,#7c3aed 45%,#5b21b6 100%);padding:44px 48px 40px;position:relative}
.header-eyebrow{color:rgba(255,255,255,0.65);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px}
.header-brand{color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.6px;line-height:1.1}
.header-rule{width:44px;height:4px;background:rgba(255,255,255,0.35);margin-top:22px;border-radius:99px}
.body{padding:44px 48px 36px}
.body h1{color:#1e1b4b;font-size:25px;font-weight:700;line-height:1.3;margin-bottom:18px;letter-spacing:-0.4px}
.body h2{color:#1e1b4b;font-size:20px;font-weight:700;line-height:1.35;margin-bottom:14px;margin-top:30px}
.body h3{color:#312e81;font-size:16px;font-weight:600;line-height:1.4;margin-bottom:10px;margin-top:24px}
.body p{color:#3f3f56;font-size:15.5px;line-height:1.8;margin-bottom:18px}
.body a{color:#7c3aed;font-weight:500;text-decoration:underline;text-underline-offset:3px}
.body strong,.body b{color:#1e1b4b;font-weight:700}
.body em,.body i{color:#52525b}
.body ul,.body ol{color:#3f3f56;padding-left:22px;margin-bottom:18px}
.body li{font-size:15.5px;line-height:1.8;margin-bottom:5px}
.body blockquote{border-left:3px solid #a78bfa;background:#f8f6ff;border-radius:0 12px 12px 0;padding:14px 20px;margin:22px 0;color:#5b5b72;font-style:italic}
.body hr{border:none;border-top:1px solid #ece9fe;margin:30px 0}
.signature{margin:36px 48px 0;padding:22px 26px;background:linear-gradient(135deg,#faf8ff,#f4f0ff);border:1px solid #e9e3fc;border-left:4px solid #7c3aed;border-radius:16px}
.sig-name{color:#1e1b4b;font-size:15px;font-weight:700;letter-spacing:-0.2px}
.sig-company{color:#7c6fae;font-size:12.5px;font-weight:600;margin-top:2px;text-transform:uppercase;letter-spacing:1px}
.sig-contact{margin-top:12px;font-size:12.5px;line-height:2}
.sig-contact a{color:#6d28d9;text-decoration:none;font-weight:500;display:block}
.footer{background:#1e1b4b;padding:30px 48px 38px;margin-top:36px}
.footer-name{color:rgba(255,255,255,0.85);font-size:13px;font-weight:700;letter-spacing:-0.2px;margin-bottom:4px}
.footer-tag{color:rgba(255,255,255,0.35);font-size:11.5px;margin-bottom:16px}
.footer-legal{color:rgba(255,255,255,0.28);font-size:11px;line-height:1.8;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px}
.footer-legal a{color:rgba(255,255,255,0.45);text-decoration:underline}
@media(max-width:600px){
  .wrapper{padding:16px 8px}
  .header{padding:32px 26px 28px}
  .body{padding:30px 26px 24px}
  .signature{margin:26px 26px 0;padding:18px 20px}
  .footer{padding:24px 26px 30px;margin-top:26px}
  .body h1{font-size:21px}
  .body h2{font-size:18px}
  .body p{font-size:15px}
}
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <div class="header-eyebrow">A message from</div>
      <div class="header-brand">{{company_name}}</div>
      <div class="header-rule"></div>
    </div>
    <div class="body">
      {{content}}
    </div>
    <div class="signature">
      <div class="sig-name">{{from_name}}</div>
      <div class="sig-company">{{company_name}}</div>
      <div class="sig-contact">
        <a href="{{company_website_url}}">{{company_website}}</a>
        <a href="mailto:{{company_email}}">{{company_email}}</a>
        <a href="tel:{{company_phone}}">{{company_phone}}</a>
      </div>
    </div>
    <div class="footer">
      <div class="footer-name">{{company_name}}</div>
      <div class="footer-tag">Sent by {{from_name}}</div>
      <div class="footer-legal">
        You're receiving this email because you're on our mailing list.<br>
        &copy; {{year}} {{company_name}}. All rights reserved.
      </div>
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
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>{{company_name}}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f7f7f9;-webkit-font-smoothing:antialiased;mso-line-height-rule:exactly}
.wrapper{padding:48px 16px}
.card{max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;border:1px solid #e8e8ee;box-shadow:0 1px 10px rgba(15,15,40,0.05);overflow:hidden}
.accent{height:3px;background-color:#6366f1;background:linear-gradient(90deg,#6366f1,#a78bfa)}
.header{padding:34px 52px 26px;border-bottom:1px solid #f1f1f6;text-align:center}
.header-brand{color:#16161f;font-size:13px;font-weight:800;letter-spacing:3px;text-transform:uppercase}
.header-from{color:#a1a1b3;font-size:11.5px;margin-top:6px;letter-spacing:0.3px}
.body{padding:44px 52px 8px}
.body h1{color:#16161f;font-size:24px;font-weight:700;line-height:1.32;margin-bottom:18px;letter-spacing:-0.4px}
.body h2{color:#16161f;font-size:19px;font-weight:700;line-height:1.35;margin-bottom:13px;margin-top:30px}
.body h3{color:#3a3a4c;font-size:16px;font-weight:600;line-height:1.4;margin-bottom:10px;margin-top:24px}
.body p{color:#494956;font-size:15.5px;line-height:1.85;margin-bottom:18px}
.body a{color:#5558e3;text-decoration:underline;text-underline-offset:3px}
.body strong,.body b{color:#16161f;font-weight:600}
.body ul,.body ol{color:#494956;padding-left:22px;margin-bottom:18px}
.body li{font-size:15.5px;line-height:1.85;margin-bottom:4px}
.body blockquote{border-left:2px solid #d6d6e3;padding:4px 20px;margin:22px 0;color:#73737f;font-style:italic}
.body hr{border:none;border-top:1px solid #f1f1f6;margin:30px 0}
.signature{margin:30px 52px 0;padding:20px 0 32px;border-top:1px solid #f1f1f6}
.sig-label{color:#a1a1b3;font-size:12px;margin-bottom:10px}
.sig-name{color:#16161f;font-size:14.5px;font-weight:700;letter-spacing:-0.2px}
.sig-company{color:#73737f;font-size:12.5px;margin-top:2px}
.sig-contact{margin-top:10px;font-size:12px;line-height:1.9}
.sig-contact a{color:#5558e3;text-decoration:none;display:block}
.footer{padding:22px 52px 30px;border-top:1px solid #f1f1f6;background:#fbfbfd;text-align:center}
.footer p{color:#a1a1b3;font-size:11px;line-height:1.8}
.footer strong{color:#494956;font-weight:600}
@media(max-width:600px){
  .wrapper{padding:18px 8px}
  .header{padding:24px 26px 20px}
  .body{padding:30px 26px 6px}
  .signature{margin:24px 26px 0;padding:16px 0 26px}
  .footer{padding:18px 26px 24px}
  .body h1{font-size:21px}
  .body p{font-size:15px}
}
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="accent"></div>
    <div class="header">
      <div class="header-brand">{{company_name}}</div>
      <div class="header-from">Message from {{from_name}}</div>
    </div>
    <div class="body">
      {{content}}
    </div>
    <div class="signature">
      <div class="sig-label">Warm regards,</div>
      <div class="sig-name">{{from_name}}</div>
      <div class="sig-company">{{company_name}}</div>
      <div class="sig-contact">
        <a href="{{company_website_url}}">{{company_website}}</a>
        <a href="mailto:{{company_email}}">{{company_email}}</a>
        <a href="tel:{{company_phone}}">{{company_phone}}</a>
      </div>
    </div>
    <div class="footer">
      <p>Sent by <strong>{{company_name}}</strong></p>
      <p style="margin-top:4px">&copy; {{year}} {{company_name}}. All rights reserved.</p>
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
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>{{company_name}}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#05060b;-webkit-font-smoothing:antialiased;mso-line-height-rule:exactly}
.wrapper{padding:44px 16px}
.card{max-width:600px;margin:0 auto;background:#0c0f17;border-radius:20px;border:1px solid rgba(148,130,255,0.14);overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.55)}
.glow{height:3px;background-color:#7c3aed;background:linear-gradient(90deg,#7c3aed 0%,#a78bfa 50%,#6366f1 100%)}
.header{padding:38px 48px 34px;border-bottom:1px solid rgba(255,255,255,0.06);background:linear-gradient(165deg,#0c0f17 30%,#161028 100%)}
.header-eyebrow{color:rgba(167,139,250,0.7);font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;margin-bottom:10px}
.header-brand{color:#f4f2ff;font-size:24px;font-weight:800;letter-spacing:-0.5px}
.header-sender{color:rgba(255,255,255,0.32);font-size:12.5px;margin-top:6px}
.body{padding:44px 48px 8px;background:#0c0f17}
.body h1{color:#f4f2ff;font-size:23px;font-weight:700;line-height:1.32;margin-bottom:18px;letter-spacing:-0.4px}
.body h2{color:#e7e4f7;font-size:19px;font-weight:700;line-height:1.35;margin-bottom:13px;margin-top:28px}
.body h3{color:#cfcae6;font-size:16px;font-weight:600;line-height:1.4;margin-bottom:10px;margin-top:22px}
.body p{color:#9b97b0;font-size:15.5px;line-height:1.85;margin-bottom:18px}
.body a{color:#b8a6ff;text-decoration:underline;text-underline-offset:3px}
.body strong,.body b{color:#e7e4f7;font-weight:600}
.body ul,.body ol{color:#9b97b0;padding-left:22px;margin-bottom:18px}
.body li{font-size:15.5px;line-height:1.85;margin-bottom:5px}
.body blockquote{border-left:3px solid rgba(167,139,250,0.5);background:rgba(124,58,237,0.08);border-radius:0 10px 10px 0;padding:12px 18px;margin:22px 0;color:#8d88a6;font-style:italic}
.body hr{border:none;border-top:1px solid rgba(255,255,255,0.07);margin:28px 0}
.signature{margin:32px 48px 0;padding:22px 26px;background:rgba(124,58,237,0.09);border:1px solid rgba(148,130,255,0.16);border-left:3px solid #a78bfa;border-radius:14px}
.sig-name{color:#f4f2ff;font-size:14.5px;font-weight:700;letter-spacing:-0.2px}
.sig-company{color:rgba(167,139,250,0.75);font-size:11.5px;font-weight:600;margin-top:3px;text-transform:uppercase;letter-spacing:1.2px}
.sig-contact{margin-top:12px;font-size:12.5px;line-height:2}
.sig-contact a{color:#b8a6ff;text-decoration:none;display:block}
.footer{padding:26px 48px 34px;border-top:1px solid rgba(255,255,255,0.05);background:rgba(0,0,0,0.35);margin-top:32px}
.footer-brand{color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px}
.footer p{color:rgba(255,255,255,0.2);font-size:11px;line-height:1.8}
@media(max-width:600px){
  .wrapper{padding:16px 8px}
  .header{padding:28px 26px 24px}
  .body{padding:30px 26px 6px}
  .signature{margin:24px 26px 0;padding:18px 20px}
  .footer{padding:20px 26px 26px;margin-top:24px}
  .body h1{font-size:20px}
  .body p{font-size:15px}
}
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="glow"></div>
    <div class="header">
      <div class="header-eyebrow">A note from</div>
      <div class="header-brand">{{company_name}}</div>
      <div class="header-sender">Sent by {{from_name}}</div>
    </div>
    <div class="body">
      {{content}}
    </div>
    <div class="signature">
      <div class="sig-name">{{from_name}}</div>
      <div class="sig-company">{{company_name}}</div>
      <div class="sig-contact">
        <a href="{{company_website_url}}">{{company_website}}</a>
        <a href="mailto:{{company_email}}">{{company_email}}</a>
        <a href="tel:{{company_phone}}">{{company_phone}}</a>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">{{company_name}}</div>
      <p>&copy; {{year}} {{company_name}}. All rights reserved.</p>
    </div>
  </div>
</div>
</body>
</html>
HTML;
    }
}
