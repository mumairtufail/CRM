<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PublicToolController extends Controller
{
    /**
     * Display the public tools hub.
     */
    public function index(): Response
    {
        return Inertia::render('Tools/Hub');
    }

    /**
     * Display the free email signature generator.
     */
    public function emailSignature(): Response
    {
        return Inertia::render('Tools/EmailSignatureGenerator');
    }

    /**
     * Display the free online invoice generator.
     */
    public function invoice(): Response
    {
        return Inertia::render('Tools/InvoiceGenerator');
    }
}
