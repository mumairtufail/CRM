<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\File;
use ZipArchive;

/**
 * Zips the canonical extension source (resources/browser-extension) on
 * demand and streams it — no stale pre-built zip to keep in sync.
 */
class ExtensionDownloadController extends Controller
{
    public function download()
    {
        $sourceDir = resource_path('browser-extension/lumenia-crm-extension');
        $zipPath = storage_path('app/tmp/lumenia-crm-extension.zip');

        File::ensureDirectoryExists(dirname($zipPath));

        $zip = new ZipArchive();
        $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        foreach (File::allFiles($sourceDir) as $file) {
            $relativePath = str_replace('\\', '/', $file->getRelativePathname());
            $zip->addFile($file->getPathname(), 'lumenia-crm-extension/'.$relativePath);
        }

        $zip->close();

        return response()->download($zipPath, 'lumenia-crm-extension.zip')->deleteFileAfterSend(true);
    }
}
