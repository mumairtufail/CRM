<?php

namespace App\Http\Controllers;

use App\Models\EmailTemplate;
use Illuminate\Http\Request;

class EmailTemplateController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:150',
            'description'      => 'nullable|string|max:300',
            'html_content'     => 'required|string',
            'thumbnail_color'  => 'nullable|string|max:20',
        ]);

        $template = $request->user()->emailTemplates()->create([
            ...$validated,
            'thumbnail_color' => $validated['thumbnail_color'] ?? '#7c3aed',
            'is_system'       => false,
        ]);

        return back()->with('status', 'template-created');
    }

    public function update(Request $request, EmailTemplate $emailTemplate)
    {
        $this->authorizeTemplate($emailTemplate, $request);

        $validated = $request->validate([
            'name'            => 'required|string|max:150',
            'description'     => 'nullable|string|max:300',
            'html_content'    => 'required|string',
            'thumbnail_color' => 'nullable|string|max:20',
        ]);

        $emailTemplate->update($validated);

        return back()->with('status', 'template-updated');
    }

    public function destroy(Request $request, EmailTemplate $emailTemplate)
    {
        $this->authorizeTemplate($emailTemplate, $request);

        // Unset active template if it's being deleted
        if ($request->user()->active_template_id === $emailTemplate->id) {
            $request->user()->update(['active_template_id' => null]);
        }

        $emailTemplate->delete();

        return back()->with('status', 'template-deleted');
    }

    public function activate(Request $request, EmailTemplate $emailTemplate)
    {
        // Both system templates and user's own templates can be activated
        if (!$emailTemplate->is_system && $emailTemplate->user_id !== $request->user()->id) {
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

    public function preview(EmailTemplate $emailTemplate)
    {
        $sampleContent = <<<HTML
<h2 style="font-size:20px;font-weight:700;margin-bottom:12px;">Hello {{first_name}},</h2>
<p>This is a preview of how your emails will look when sent using this template. Your campaign content will appear here, replacing this placeholder text.</p>
<p>You can include <strong>bold text</strong>, <em>italics</em>, and <a href="#">hyperlinks</a> in your campaigns.</p>
<p>Best regards,<br><strong>{{from_name}}</strong></p>
HTML;

        $html = $emailTemplate->render([
            'content'      => $sampleContent,
            'company_name' => 'Acme Corp',
            'from_name'    => 'John Smith',
            'first_name'   => 'Sarah',
            'year'         => date('Y'),
        ]);

        return response($html)->header('Content-Type', 'text/html');
    }

    private function authorizeTemplate(EmailTemplate $template, Request $request): void
    {
        if ($template->is_system || $template->user_id !== $request->user()->id) {
            abort(403, 'You cannot modify this template.');
        }
    }
}
