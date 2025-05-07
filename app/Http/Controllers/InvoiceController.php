<?php

namespace App\Http\Controllers;

use App\Enums\InvoiceStatus;
use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Models\Invoice;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInvoiceRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Invoice $invoice)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Invoice $invoice)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInvoiceRequest $request, Invoice $invoice)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Invoice $invoice)
    {
        //
    }

    public function upload(Request $request)
    {
        // Validate the uploaded file
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,pdf|max:5120', // 5MB max
        ], [
            'file.required' => 'No file was provided.',
            'file.mimes' => 'Only JPG, PNG, GIF, and PDF files are allowed.',
            'file.max' => 'File size should not exceed 5MB.',
        ]);

        // Use Media library to handle the file upload
        $invoice = Invoice::create([
            'status' => InvoiceStatus::UPLOADED,
            'filename' => $request->file('file')->getClientOriginalName(),
            'subtotal' => 0,
            'tax_rate' => 0,
            'tax_amount' => 0,
            'discount' => 0,
            'total' => 0,
            'user_id' => auth()->id(),
            'team_id' => auth()->user()->currentTeam->id ?? null,
        ]);

        $media = $invoice
            ->addMedia($request->file('file'))
            ->toMediaCollection('invoices', 'invoices');

        return redirect()->back()->with('success', 'File uploaded successfully.');
    }
}
