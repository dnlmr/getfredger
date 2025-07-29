<?php

namespace App\Jobs;

use App\Enums\InvoiceStatus;
use App\Models\Invoice;
use App\Prompts\InvoicePrompt;
use App\Schemas\InvoiceSchema;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Prism\Prism\Enums\Provider;
use Prism\Prism\Exceptions\PrismException;
use Prism\Prism\Prism;
use Prism\Prism\ValueObjects\Media\Image;
use Prism\Prism\ValueObjects\Messages\UserMessage;

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
        Log::info('Start processing invoice image', [
            'invoice_id' => $this->invoice->id,
        ]);

        // Get the image from the media library
        $media = $this->invoice->getFirstMedia('invoices');

        if (! $media) {
            Log::error('No media found for invoice', [
                'invoice_id' => $this->invoice->id,
            ]);

            return;
        }

        // Process the image (e.g., OCR, text extraction, etc.)
        Log::info('Processing image', [
            'invoice_id' => $this->invoice->id,
            'media_id' => $media->id,
        ]);

        $hasOptimized = $media->hasGeneratedConversion('vision-optimized');
        $imagePath = $hasOptimized
            ? $media->getPath('vision-optimized')
            : $media->getPath();

        Log::info('Using image path', [
            'invoice_id' => $this->invoice->id,
            'using_optimized' => $hasOptimized,
            'image_path' => $imagePath,
        ]);

        // Define schema for the invoice
        $schema = InvoiceSchema::getSchema();

        // Prompt for structured data extraction
        $prompt = InvoicePrompt::getPrompt();

        // Include image path in the prompt
        $message = new UserMessage(
            $prompt,
            [Image::fromLocalPath($imagePath)]
        );

        Log::info('Sending image to Prism for processing', [
            'invoice_id' => $this->invoice->id,
            'image_path' => $imagePath,
        ]);

        // Set the model to use (e.g., 'gpt-4o', 'gpt-4o-mini', etc.)
        $model = 'gpt-4o-mini';

        try {
            // Send to AI API endpoint for processing
            $response = Prism::structured()
                ->using(Provider::OpenAI, $model)
                ->withSchema($schema)
                ->usingTemperature(0)
                ->withMessages([$message])
                ->withClientOptions(['timeout' => 120])
                // Explicitly disable strict mode for OpenAI
                ->withProviderOptions(['schema' => ['strict' => false]])
                ->asStructured();
        } catch (PrismException $e) {
            Log::error('Prism processing failed', [
                'invoice_id' => $this->invoice->id,
                'error' => $e->getMessage(),
            ]);

            // You might want to mark the invoice as failed or retry
            $this->invoice->status = InvoiceStatus::NO_INVOICE; // or create a FAILED status
            $this->invoice->save();

            return;
        }

        if ($response && $response->structured) {
            Log::info('Received structured response from Prism, storing results', [
                'invoice_id' => $this->invoice->id,
                'data' => $response->structured,
            ]);

            // Always store model and token usage from this AI call
            $this->invoice->prompt_tokens = $response->usage->promptTokens;
            $this->invoice->completion_tokens = $response->usage->completionTokens;
            $this->invoice->model = $model;

            // Check if the AI determined it's not an invoice based on the specific title
            if (isset($response->structured['invoice_title']) && $response->structured['invoice_title'] === 'The image is not an invoice/receipt') {
                Log::info('AI determined the document is not an invoice/receipt based on title.', [
                    'invoice_id' => $this->invoice->id,
                    'invoice_title' => $response->structured['invoice_title'],
                    'invoice_description' => $response->structured['invoice_description'] ?? 'N/A',
                ]);
                $this->invoice->status = InvoiceStatus::NO_INVOICE;

                // Persist the AI's findings, including the specific title and description
                $this->invoice->invoice_title = $response->structured['invoice_title'];
                $this->invoice->invoice_description = $response->structured['invoice_description'] ?? 'No description provided.';

                // Ensure invoice_date is null if not a valid date, as per prompt instructions
                $this->invoice->invoice_number = null;
                $this->invoice->invoice_date = null;

                $this->invoice->sender_company_name = null;
                $this->invoice->sender_address = null;

                $this->invoice->total = null;
                $this->invoice->subtotal = null;
                $this->invoice->tax_rate = null;
                $this->invoice->tax_amount = null;
                $this->invoice->discount = null;
                $this->invoice->currency = null;
                $this->invoice->notes = null;
                $this->invoice->payment_terms = null;
                $this->invoice->sender_email = null;
                $this->invoice->sender_tax_number = null;
                $this->invoice->recipient_company_name = null;
                $this->invoice->recipient_address = null;
                $this->invoice->recipient_tax_number = null;
                $this->invoice->confidence = $response->structured['confidence'] ?? 0;

                $this->invoice->extracted_text = $response->structured['extracted_text'] ?? null;
            } else {
                // It is (or seems to be) an invoice
                Log::info('AI processed the document as an invoice.', [
                    'invoice_id' => $this->invoice->id,
                ]);
                $this->invoice->fill($response->structured);
                $this->invoice->status = InvoiceStatus::PROCESSED;
            }

            $this->invoice->save();

        } else {
            Log::error('No structured response received from Prism', [
                'invoice_id' => $this->invoice->id,
            ]);
        }
    }
}
