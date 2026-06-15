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
 *   {{signature_contact}}   — pre-built signature links (omits empty fields)
 *   {{signature_inline}}    — " · " separated company · website · email line
 *   {{from_initials}}       — sender initials for the avatar (e.g. "UT")
 */
class EmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name'            => 'Linear Minimal',
                'description'     => 'Ultra-clean white layout inspired by Linear, Notion and Superhuman. Plain links, avatar signature, no graphics.',
                'thumbnail_color' => '#534ab7',
                'html_content'    => self::linearMinimal(),
            ],
            [
                'name'            => 'Warm Cream',
                'description'     => 'Ivory canvas with a soft cream header, gold accents and a serif touch. Premium and inviting.',
                'thumbnail_color' => '#c0894e',
                'html_content'    => self::warmCream(),
            ],
            [
                'name'            => 'Editorial Sand',
                'description'     => 'Quiet warm-neutral layout with hairline rules and an elegant editorial signature.',
                'thumbnail_color' => '#94795a',
                'html_content'    => self::editorialSand(),
            ],
            [
                'name'            => 'Charcoal Luxe',
                'description'     => 'Deep espresso theme with warm cream type and a glowing gold signature block.',
                'thumbnail_color' => '#1c1917',
                'html_content'    => self::charcoalLuxe(),
            ],
        ];

        foreach ($templates as $data) {
            EmailTemplate::updateOrCreate(
                ['name' => $data['name'], 'is_system' => true],
                [...$data, 'is_system' => true, 'user_id' => null, 'organization_id' => null]
            );
        }

        // Retire the old purple-era templates so they don't linger alongside the new set.
        EmailTemplate::where('is_system', true)
            ->whereIn('name', ['Modern Purple', 'Clean Minimal', 'Dark Pro'])
            ->delete();
    }

    private static function linearMinimal(): string
    {
        return <<<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>{{company_name}}</title>
<style>
  body{margin:0;padding:0;background:#ffffff;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  table{border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0}
  img{border:0;line-height:100%;outline:none;text-decoration:none}
  a{text-decoration:none}
  /* campaign body (editor output) */
  .em-body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#4a4a4a}
  .em-body p{margin:0 0 16px;font-size:14px;line-height:1.75;color:#4a4a4a}
  .em-body p:first-child{font-size:15px;color:#1a1a1a;margin-bottom:18px}
  .em-body a{color:#1a1a1a;text-decoration:underline;text-underline-offset:2px}
  .em-body strong,.em-body b{color:#1a1a1a;font-weight:600}
  .em-body em,.em-body i{color:#888888;font-style:italic}
  .em-body h1{font-size:18px;line-height:1.4;color:#1a1a1a;font-weight:700;margin:0 0 14px}
  .em-body h2{font-size:16px;line-height:1.4;color:#1a1a1a;font-weight:700;margin:26px 0 12px}
  .em-body ul,.em-body ol{margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.75;color:#4a4a4a}
  .em-body li{margin-bottom:6px}
  .em-body blockquote{margin:18px 0;padding:2px 16px;border-left:2px solid #e0ddd8;color:#888888;font-style:italic}
  .em-body hr{border:none;border-top:1px solid #e0ddd8;margin:24px 0}
  @media only screen and (max-width:600px){
    .em-container{width:100% !important}
    .em-pad{padding-left:22px !important;padding-right:22px !important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#ffffff;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">
<tr>
<td align="center" style="padding:24px 12px;">
  <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
  <table role="presentation" class="em-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid #ececec;border-radius:8px;">
    <tr>
      <td class="em-pad" align="left" style="padding:20px 28px;border-bottom:1px solid #e0ddd8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;color:#1a1a1a;letter-spacing:-0.2px;">{{header_brand}}</td>
    </tr>
    <tr>
      <td class="em-pad em-body" style="padding:28px;">
        {{content}}
      </td>
    </tr>
    <tr>
      <td class="em-pad" style="padding:20px 28px 24px;border-top:1px solid #e0ddd8;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="middle" width="32" style="padding-right:12px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" valign="middle" width="32" height="32" bgcolor="#534AB7" style="width:32px;height:32px;border-radius:16px;background:#534AB7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;color:#ffffff;text-align:center;line-height:32px;">{{from_initials}}</td>
                </tr>
              </table>
            </td>
            <td valign="middle" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              <div style="font-size:14px;font-weight:700;color:#1a1a1a;line-height:1.3;">{{from_name}}</div>
              <div style="font-size:11px;color:#888888;line-height:1.4;margin-top:2px;">{{signature_inline}}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:16px 28px;background:#f9f8f6;border-top:1px solid #e0ddd8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <div style="font-size:11px;color:#999999;line-height:1.6;">&copy; {{year}} {{company_name}}. All rights reserved.</div>
      </td>
    </tr>
  </table>
  <!--[if mso]></td></tr></table><![endif]-->
</td>
</tr>
</table>
</body>
</html>
HTML;
    }

    private static function warmCream(): string
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
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#efe6d6;-webkit-font-smoothing:antialiased;mso-line-height-rule:exactly}
.wrapper{padding:44px 16px}
.card{max-width:600px;margin:0 auto;background:#fffdf8;border-radius:22px;overflow:hidden;box-shadow:0 18px 50px rgba(120,86,42,0.16),0 2px 6px rgba(80,60,30,0.05)}
.header{background-color:#f3e7d2;background:linear-gradient(135deg,#f7eedd 0%,#efe0c6 55%,#e7d3b2 100%);padding:42px 48px 36px;border-bottom:1px solid #e8d8bd}
.header-badge{display:inline-block;background:#7a4f1f;color:#fdf6e8;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;padding:5px 12px;border-radius:999px;margin-bottom:16px}
.header-brand{color:#3b2c1a;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;letter-spacing:-0.4px;line-height:1.1}
.header-rule{width:46px;height:3px;background:#c79a55;margin-top:18px;border-radius:99px}
.body{padding:42px 48px 30px}
.body h1{color:#2c2113;font-family:Georgia,'Times New Roman',serif;font-size:25px;font-weight:700;line-height:1.3;margin-bottom:18px;letter-spacing:-0.3px}
.body h2{color:#2c2113;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;line-height:1.35;margin-bottom:14px;margin-top:30px}
.body h3{color:#5a4528;font-size:16px;font-weight:600;line-height:1.4;margin-bottom:10px;margin-top:24px}
.body p{color:#4a3f31;font-size:15.5px;line-height:1.8;margin-bottom:18px}
.body a{color:#a9742e;font-weight:500;text-decoration:underline;text-underline-offset:3px}
.body strong,.body b{color:#2c2113;font-weight:700}
.body em,.body i{color:#6b5a43}
.body ul,.body ol{color:#4a3f31;padding-left:22px;margin-bottom:18px}
.body li{font-size:15.5px;line-height:1.8;margin-bottom:5px}
.body blockquote{border-left:3px solid #d7b577;background:#faf3e4;border-radius:0 12px 12px 0;padding:14px 20px;margin:22px 0;color:#6b5a43;font-style:italic}
.body hr{border:none;border-top:1px solid #ece0cb;margin:30px 0}
.signature{margin:34px 48px 0;padding:22px 26px;background:linear-gradient(135deg,#fbf4e6,#f6ead2);border:1px solid #ecdcbe;border-left:4px solid #c79a55;border-radius:16px}
.sig-name{color:#2c2113;font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:-0.2px}
.sig-company{color:#a9742e;font-size:12px;font-weight:600;margin-top:3px;text-transform:uppercase;letter-spacing:1.2px}
.sig-contact{margin-top:12px;font-size:12.5px;line-height:2}
.sig-contact a{color:#7a4f1f;text-decoration:none;font-weight:500;display:block}
.footer{background:#2c2113;padding:30px 48px 36px;margin-top:34px}
.footer-name{color:#f3e7d2;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:700;margin-bottom:4px}
.footer-tag{color:rgba(243,231,210,0.45);font-size:11.5px;margin-bottom:16px}
.footer-legal{color:rgba(243,231,210,0.35);font-size:11px;line-height:1.8;border-top:1px solid rgba(243,231,210,0.12);padding-top:16px}
.footer-legal a{color:rgba(243,231,210,0.55);text-decoration:underline}
@media(max-width:600px){
  .wrapper{padding:16px 8px}
  .header{padding:30px 26px 26px}
  .body{padding:30px 26px 22px}
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
      <span class="header-badge">A message from</span>
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
        {{signature_contact}}
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

    private static function editorialSand(): string
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
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f4efe6;-webkit-font-smoothing:antialiased;mso-line-height-rule:exactly}
.wrapper{padding:48px 16px}
.card{max-width:600px;margin:0 auto;background:#fffdf9;border-radius:14px;border:1px solid #e8dfcd;box-shadow:0 1px 12px rgba(80,60,30,0.06);overflow:hidden}
.accent{height:3px;background-color:#bf9b63;background:linear-gradient(90deg,#cdae74,#a9742e)}
.header{padding:36px 52px 26px;border-bottom:1px solid #efe6d4;text-align:center}
.header-brand{color:#2c2418;font-family:Georgia,'Times New Roman',serif;font-size:21px;font-weight:700;letter-spacing:0.4px}
.header-from{color:#a99a7c;font-size:11.5px;margin-top:7px;letter-spacing:1.5px;text-transform:uppercase}
.body{padding:44px 52px 8px}
.body h1{color:#2c2418;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;line-height:1.32;margin-bottom:18px;letter-spacing:-0.3px}
.body h2{color:#2c2418;font-family:Georgia,'Times New Roman',serif;font-size:19px;font-weight:700;line-height:1.35;margin-bottom:13px;margin-top:30px}
.body h3{color:#524733;font-size:16px;font-weight:600;line-height:1.4;margin-bottom:10px;margin-top:24px}
.body p{color:#4d4434;font-size:15.5px;line-height:1.85;margin-bottom:18px}
.body a{color:#a9742e;text-decoration:underline;text-underline-offset:3px}
.body strong,.body b{color:#2c2418;font-weight:600}
.body ul,.body ol{color:#4d4434;padding-left:22px;margin-bottom:18px}
.body li{font-size:15.5px;line-height:1.85;margin-bottom:4px}
.body blockquote{border-left:2px solid #d8c39a;padding:4px 20px;margin:22px 0;color:#776a52;font-style:italic}
.body hr{border:none;border-top:1px solid #efe6d4;margin:30px 0}
.signature{margin:30px 52px 0;padding:22px 0 32px;border-top:1px solid #efe6d4}
.sig-label{color:#a99a7c;font-size:12px;margin-bottom:10px;font-style:italic;font-family:Georgia,'Times New Roman',serif}
.sig-name{color:#2c2418;font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:-0.2px}
.sig-company{color:#776a52;font-size:12.5px;margin-top:3px}
.sig-contact{margin-top:10px;font-size:12px;line-height:1.9}
.sig-contact a{color:#a9742e;text-decoration:none;display:block}
.footer{padding:22px 52px 30px;border-top:1px solid #efe6d4;background:#faf6ed;text-align:center}
.footer p{color:#a99a7c;font-size:11px;line-height:1.8}
.footer strong{color:#776a52;font-weight:600}
@media(max-width:600px){
  .wrapper{padding:18px 8px}
  .header{padding:26px 26px 20px}
  .body{padding:30px 26px 6px}
  .signature{margin:24px 26px 0;padding:18px 0 26px}
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
        {{signature_contact}}
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

    private static function charcoalLuxe(): string
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
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#13100c;-webkit-font-smoothing:antialiased;mso-line-height-rule:exactly}
.wrapper{padding:44px 16px}
.card{max-width:600px;margin:0 auto;background:#1f1a14;border-radius:20px;border:1px solid rgba(201,168,106,0.18);overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.6)}
.glow{height:3px;background-color:#c9a86a;background:linear-gradient(90deg,#8a6a30 0%,#d8b878 50%,#c9a86a 100%)}
.header{padding:38px 48px 32px;border-bottom:1px solid rgba(201,168,106,0.12);background:linear-gradient(165deg,#1f1a14 30%,#2a2018 100%)}
.header-eyebrow{color:#c9a86a;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;margin-bottom:12px}
.header-brand{color:#f6ecd8;font-family:Georgia,'Times New Roman',serif;font-size:25px;font-weight:700;letter-spacing:-0.4px}
.header-sender{color:rgba(246,236,216,0.4);font-size:12.5px;margin-top:7px}
.body{padding:44px 48px 8px;background:#1f1a14}
.body h1{color:#f6ecd8;font-family:Georgia,'Times New Roman',serif;font-size:23px;font-weight:700;line-height:1.32;margin-bottom:18px;letter-spacing:-0.3px}
.body h2{color:#ece0c8;font-family:Georgia,'Times New Roman',serif;font-size:19px;font-weight:700;line-height:1.35;margin-bottom:13px;margin-top:28px}
.body h3{color:#d4c4a4;font-size:16px;font-weight:600;line-height:1.4;margin-bottom:10px;margin-top:22px}
.body p{color:#b3a78f;font-size:15.5px;line-height:1.85;margin-bottom:18px}
.body a{color:#dcc08a;text-decoration:underline;text-underline-offset:3px}
.body strong,.body b{color:#ece0c8;font-weight:600}
.body ul,.body ol{color:#b3a78f;padding-left:22px;margin-bottom:18px}
.body li{font-size:15.5px;line-height:1.85;margin-bottom:5px}
.body blockquote{border-left:3px solid rgba(201,168,106,0.5);background:rgba(201,168,106,0.08);border-radius:0 10px 10px 0;padding:12px 18px;margin:22px 0;color:#a99c82;font-style:italic}
.body hr{border:none;border-top:1px solid rgba(201,168,106,0.12);margin:28px 0}
.signature{margin:32px 48px 0;padding:22px 26px;background:rgba(201,168,106,0.08);border:1px solid rgba(201,168,106,0.2);border-left:3px solid #c9a86a;border-radius:14px}
.sig-name{color:#f6ecd8;font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:-0.2px}
.sig-company{color:#c9a86a;font-size:11.5px;font-weight:600;margin-top:3px;text-transform:uppercase;letter-spacing:1.4px}
.sig-contact{margin-top:12px;font-size:12.5px;line-height:2}
.sig-contact a{color:#dcc08a;text-decoration:none;display:block}
.footer{padding:26px 48px 34px;border-top:1px solid rgba(201,168,106,0.1);background:rgba(0,0,0,0.3);margin-top:32px}
.footer-brand{color:rgba(246,236,216,0.5);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px}
.footer p{color:rgba(246,236,216,0.25);font-size:11px;line-height:1.8}
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
        {{signature_contact}}
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
