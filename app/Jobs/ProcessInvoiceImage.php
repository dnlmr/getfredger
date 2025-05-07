<?php

namespace App\Jobs;

use App\Models\Invoice;
use Illuminate\Support\Facades\Log;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class ProcessInvoiceImage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(protected Invoice $invoice)
    {
        Log::info('ProcessInvoiceImage job created', [
            'invoice_id' => $invoice->id,
        ]);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        //
    }
}
