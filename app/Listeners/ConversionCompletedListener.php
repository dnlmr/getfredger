<?php

namespace App\Listeners;

use App\Jobs\ProcessInvoiceImage;
use App\Models\Invoice;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Spatie\MediaLibrary\Conversions\Events\ConversionHasBeenCompletedEvent;

class ConversionCompletedListener implements ShouldHandleEventsAfterCommit, ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(ConversionHasBeenCompletedEvent $event): void
    {
        Log::info('Conversion completed', [
            'conversion_name' => $event->conversion->getName(),
            'model_type' => get_class($event->media->model),
            'media_id' => $event->media->id,
            'conversion_name' => $event->media->collection_name,
            'conversion_properties' => [
                'manipulations' => $event->media->manipulations,
                'generated_conversions' => $event->media->generated_conversions,
            ],
            'timestamp' => now(),
        ]);

        // Only process if this is the vision-optimized conversion for an invoice
        if ($event->conversion->getName() !== 'vision-optimized') {
            Log::info('Skipping - not vision-optimized conversion', [
                'actual_conversion' => $event->conversion->getName(),
            ]);

            return;
        }

        if (! ($event->media->model instanceof Invoice)) {
            Log::info('Skipping - model is not an Invoice', [
                'model_type' => get_class($event->media->model),
            ]);

            return;
        }

        if ($event->media->collection_name !== 'invoices') {
            Log::info('Skipping - not from invoices collection', [
                'collection' => $event->media->collection_name,
            ]);

            return;
        }

        Log::info('Dispatching ProcessInvoiceImage job', [
            'invoice_id' => $event->media->model->id,
            'media_id' => $event->media->id,
            'conversion_name' => $event->conversion->getName(),
            'collection_name' => $event->media->collection_name,
        ]);

        // Dispatch the job with the media model's invoice
        ProcessInvoiceImage::dispatch($event->media->model)->onQueue('default');
    }
}
