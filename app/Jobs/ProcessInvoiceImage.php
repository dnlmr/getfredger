<?php

namespace App\Jobs;

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
use Prism\Prism\Prism;
use Prism\Prism\ValueObjects\Messages\Support\Image;
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
            [Image::fromPath($imagePath)]
        );

        Log::info('Sending image to Prism for processing', [
            'invoice_id' => $this->invoice->id,
            'image_path' => $imagePath,
        ]);

        // Set the model to use (e.g., 'gpt-4.1', 'gpt-4o-mini', etc.)
        $model = 'gpt-4o-mini';

        // Send to AI API endpoint for processing
        $response = Prism::structured()
            // ->using(Provider::Ollama, 'gemma3:12b')
            // ->using(Provider::Groq, 'meta-llama/llama-4-scout-17b-16e-instruct')
            ->using(Provider::OpenAI, $model)
            ->withSchema($schema)
            ->usingTemperature(0)
            ->withMessages([$message])
            ->withClientOptions(['timeout' => 120])
            ->asStructured();

        if ($response && $response->structured) {
            Log::info('Received structured response from Prism, storing results', [
                'invoice_id' => $this->invoice->id,
                'data' => $response->structured,
            ]);

            // Save the structured data to the invoice
            $this->invoice->fill($response->structured);
            $this->invoice->prompt_tokens = $response->usage->promptTokens;
            $this->invoice->completion_tokens = $response->usage->completionTokens;
            $this->invoice->model = $model;
            $this->invoice->save();

        } else {
            Log::error('No structured response received from Prism', [
                'invoice_id' => $this->invoice->id,
            ]);
        }
    }
}
