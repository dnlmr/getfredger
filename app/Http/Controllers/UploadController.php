<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class UploadController extends Controller
{
    /**
     * Handle file upload - simplified for single file uploads.
     */
    public function __invoke(Request $request)
    {
        // Validate the uploaded file
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,pdf|max:5120', // 5MB max
        ], [
            'file.required' => 'No file was provided.',
            'file.mimes' => 'Only JPG, PNG, GIF, and PDF files are allowed.',
            'file.max' => 'File size should not exceed 5MB.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $file = $request->file('file');
        $path = $file->store('invoices', 'public');

        $uploadedFile = [
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'size' => $file->getSize(),
            'type' => $file->getMimeType(),
            'url' => Storage::url($path),
        ];

        return back()->with('success', 'File uploaded successfully.');
    }
}
