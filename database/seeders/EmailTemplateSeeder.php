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
                'description'     => 'Bold purple header with a clean white body. Polished and on-brand.',
                'thumbnail_color' => '#7c3aed',
                'html_content'    => self::modernPurple(),
            ],
            [
                'name'            => 'Clean Minimal',
                'description'     => 'Ultra-clean white layout with a subtle accent. Content-first, distraction-free.',
                'thumbnail_color' => '#6366f1',
                'html_content'    => self::cleanMinimal(),
            ],
            [
                'name'            => 'Dark Pro',
                'description'     => 'Sophisticated dark theme with violet accents. Stands out in any inbox.',
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
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#ede9fe;-webkit-font-smoothing:antialiased;mso-line-height-rule:exactly}
.wrapper{padding:40px 16px}
.card{max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(109,40,217,0.14),0 1px 4px rgba(0,0,0,0.06)}
.header{background:linear-gradient(145deg,#7c3aed 0%,#6d28d9 50%,#5b21b6 100%);padding:40px 48px}
.header-brand{color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;line-height:1}
.header-sender{color:rgba(255,255,255,0.55);font-size:13px;margin-top:8px}
.header-rule{width:40px;height:3px;background:rgba(255,255,255,0.25);margin-top:24px;border-radius:2px}
.body{padding:48px}
.body h1{color:#1e1b4b;font-size:26px;font-weight:700;line-height:1.25;margin-bottom:20px;letter-spacing:-0.5px}
.body h2{color:#1e1b4b;font-size:21px;font-weight:600;line-height:1.3;margin-bottom:16px;margin-top:32px}
.body h3{color:#374151;font-size:17px;font-weight:600;line-height:1.4;margin-bottom:12px;margin-top:24px}
.body p{color:#374151;font-size:16px;line-height:1.8;margin-bottom:20px}
.body a{color:#7c3aed;text-decoration:underline;text-underline-offset:3px}
.body strong,.body b{color:#111827;font-weight:600}
.body em,.body i{color:#4b5563}
.body ul,.body ol{color:#374151;padding-left:22px;margin-bottom:20px}
.body li{font-size:16px;line-height:1.8;margin-bottom:4px}
.body blockquote{border-left:3px solid #7c3aed;padding:6px 20px;margin:24px 0;color:#6b7280;font-style:italic}
.body hr{border:none;border-top:1px solid #f0effe;margin:32px 0}
.footer{background:#1e1b4b;padding:28px 48px 36px}
.footer-name{color:rgba(255,255,255,0.7);font-size:13px;font-weight:700;letter-spacing:-0.2px;margin-bottom:12px}
.footer-links{margin-bottom:14px}
.footer-links a{color:rgba(255,255,255,0.35);font-size:12px;text-decoration:none;margin-right:18px}
.footer-legal{color:rgba(255,255,255,0.25);font-size:11.5px;line-height:1.75}
@media(max-width:600px){
  .wrapper{padding:16px 8px}
  .header{padding:28px 24px}
  .body{padding:28px 24px}
  .footer{padding:22px 24px 28px}
  .body h1{font-size:22px}
  .body h2{font-size:18px}
  .body p{font-size:15px}
}
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <div class="header-brand">{{company_name}}</div>
      <div class="header-sender">{{from_name}}</div>
      <div class="header-rule"></div>
    </div>
    <div class="body">
      {{content}}
    </div>
    <div class="footer">
      <div class="footer-name">{{company_name}}</div>
      <div class="footer-links">
        <a href="#">Unsubscribe</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Contact Us</a>
      </div>
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
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f6f8fa;-webkit-font-smoothing:antialiased;mso-line-height-rule:exactly}
.wrapper{padding:40px 16px}
.card{max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;box-shadow:0 1px 8px rgba(0,0,0,0.05);overflow:hidden}
.accent{height:4px;background:linear-gradient(90deg,#7c3aed 0%,#818cf8 100%)}
.header{padding:28px 48px 24px;border-bottom:1px solid #f1f5f9}
.header-brand{color:#111827;font-size:15px;font-weight:800;letter-spacing:-0.3px}
.header-from{color:#9ca3af;font-size:11.5px;margin-top:3px}
.body{padding:40px 48px}
.body h1{color:#111827;font-size:25px;font-weight:700;line-height:1.25;margin-bottom:18px;letter-spacing:-0.5px}
.body h2{color:#111827;font-size:20px;font-weight:600;line-height:1.3;margin-bottom:14px;margin-top:32px}
.body h3{color:#374151;font-size:16px;font-weight:600;line-height:1.4;margin-bottom:10px;margin-top:24px}
.body p{color:#374151;font-size:15.5px;line-height:1.8;margin-bottom:18px}
.body a{color:#7c3aed;text-decoration:underline;text-underline-offset:3px}
.body strong,.body b{color:#111827;font-weight:600}
.body ul,.body ol{color:#374151;padding-left:22px;margin-bottom:18px}
.body li{font-size:15.5px;line-height:1.8;margin-bottom:4px}
.body blockquote{border-left:2px solid #e5e7eb;padding:4px 18px;margin:20px 0;color:#6b7280;font-style:italic}
.body hr{border:none;border-top:1px solid #f1f5f9;margin:28px 0}
.footer{padding:20px 48px 28px;border-top:1px solid #f1f5f9;background:#fafafa;text-align:center}
.footer p{color:#9ca3af;font-size:11.5px;line-height:1.75}
.footer a{color:#7c3aed;text-decoration:none}
.footer strong{color:#374151;font-weight:600}
@media(max-width:600px){
  .wrapper{padding:16px 8px}
  .header{padding:20px 24px 18px}
  .body{padding:28px 24px}
  .footer{padding:16px 24px 22px}
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
    <div class="footer">
      <p>Sent by <strong>{{company_name}}</strong> &nbsp;&middot;&nbsp; <a href="#">Unsubscribe</a> &nbsp;&middot;&nbsp; <a href="#">Privacy Policy</a></p>
      <p style="margin-top:5px">&copy; {{year}} {{company_name}}. All rights reserved.</p>
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
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#07090f;-webkit-font-smoothing:antialiased;mso-line-height-rule:exactly}
.wrapper{padding:40px 16px}
.card{max-width:600px;margin:0 auto;background:#0d1117;border-radius:16px;border:1px solid rgba(255,255,255,0.07);overflow:hidden}
.header{padding:36px 48px;border-bottom:1px solid rgba(255,255,255,0.06);background:linear-gradient(160deg,#0d1117 0%,#130f21 100%)}
.header-brand{color:#f0f6fc;font-size:20px;font-weight:800;letter-spacing:-0.4px}
.header-brand em{font-style:normal;background:linear-gradient(90deg,#a78bfa,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.header-sender{color:rgba(255,255,255,0.3);font-size:12.5px;margin-top:6px}
.header-rule{width:32px;height:2px;background:linear-gradient(90deg,#7c3aed,#818cf8);margin-top:20px;border-radius:1px}
.body{padding:48px;background:#0d1117}
.body h1{color:#f0f6fc;font-size:24px;font-weight:700;line-height:1.25;margin-bottom:18px;letter-spacing:-0.5px}
.body h2{color:#e6edf3;font-size:19px;font-weight:600;line-height:1.3;margin-bottom:14px;margin-top:30px}
.body h3{color:#cdd9e5;font-size:16px;font-weight:600;line-height:1.4;margin-bottom:10px;margin-top:22px}
.body p{color:#8b949e;font-size:15.5px;line-height:1.85;margin-bottom:18px}
.body a{color:#a78bfa;text-decoration:underline;text-underline-offset:3px}
.body strong,.body b{color:#e6edf3;font-weight:600}
.body ul,.body ol{color:#8b949e;padding-left:22px;margin-bottom:18px}
.body li{font-size:15.5px;line-height:1.85;margin-bottom:4px}
.body blockquote{border-left:2px solid rgba(167,139,250,0.35);padding:4px 18px;margin:20px 0;color:#6e7681;font-style:italic}
.body hr{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:30px 0}
.footer{padding:24px 48px 32px;border-top:1px solid rgba(255,255,255,0.05);background:rgba(0,0,0,0.25)}
.footer-brand{color:rgba(255,255,255,0.35);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px}
.footer p{color:rgba(255,255,255,0.18);font-size:11.5px;line-height:1.75}
.footer a{color:rgba(167,139,250,0.45);text-decoration:none}
@media(max-width:600px){
  .wrapper{padding:16px 8px}
  .header{padding:24px}
  .body{padding:28px 24px}
  .footer{padding:18px 24px 24px}
  .body h1{font-size:20px}
  .body p{font-size:15px}
}
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <div class="header-brand"><em>{{company_name}}</em></div>
      <div class="header-sender">{{from_name}}</div>
      <div class="header-rule"></div>
    </div>
    <div class="body">
      {{content}}
    </div>
    <div class="footer">
      <div class="footer-brand">{{company_name}}</div>
      <p><a href="#">Unsubscribe</a> &nbsp;&middot;&nbsp; <a href="#">Privacy Policy</a></p>
      <p style="margin-top:4px">&copy; {{year}} {{company_name}}. All rights reserved.</p>
    </div>
  </div>
</div>
</body>
</html>
HTML;
    }
}
