<?php

namespace App\Http\Controllers;

use App\Models\EmailTemplate;
use Illuminate\Http\Request;

class EmailTemplateController extends Controller
{
    public function activate(Request $request, EmailTemplate $emailTemplate)
    {
        if (!$emailTemplate->is_system) {
            abort(403);
        }

        $request->user()->update(['active_template_id' => $emailTemplate->id]);

        return back()->with('status', 'template-activated');
    }

    public function deactivate(Request $request)
    {
        $request->user()->update(['active_template_id' => null]);
        return back()->with('status', 'template-deactivated');
    }

    public function preview(Request $request, EmailTemplate $emailTemplate)
    {
        $user = $request->user();

        $sampleContent = <<<HTML
<h2 style="font-size:20px;font-weight:700;margin-bottom:12px;">Hello {{first_name}},</h2>
<p>This is a preview of how your emails will look when sent using this template. Your campaign content will appear here, replacing this placeholder text.</p>
<p>You can include <strong>bold text</strong>, <em>italics</em>, and <a href="#">hyperlinks</a> in your campaigns.</p>
<p>The signature below is built into the template — it pulls your name, company, website, phone, and email from Settings → Workspace.</p>
HTML;

        $vars = EmailTemplate::varsFor($user, $user->name ?: 'John Smith');

        // Fill in sample signature data when workspace settings are empty
        $vars['company_name']        = $vars['company_name'] ?: 'Acme Corp';
        $vars['company_website']     = $vars['company_website'] ?: 'www.acme.com';
        $vars['company_website_url'] = $vars['company_website_url'] ?: 'https://www.acme.com';
        $vars['company_phone']       = $vars['company_phone'] ?: '+1 (555) 000-1234';
        $vars['company_email']       = $vars['company_email'] ?: 'hello@acme.com';
        $vars['signature_contact']   = EmailTemplate::signatureContactHtml($vars);

        $html = $emailTemplate->render([
            ...$vars,
            'content'    => str_replace('{{first_name}}', 'Sarah', $sampleContent),
            'first_name' => 'Sarah',
        ]);

        return response($html)->header('Content-Type', 'text/html');
    }
}
