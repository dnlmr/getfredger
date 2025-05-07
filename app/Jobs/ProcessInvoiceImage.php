<?php

namespace App\Jobs;

use App\Models\Invoice;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Prism\Prism\Enums\Provider;
use Prism\Prism\Prism;
use Prism\Prism\Schema\NumberSchema;
use Prism\Prism\Schema\ObjectSchema;
use Prism\Prism\Schema\StringSchema;
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
        $schema = new ObjectSchema(
            name: 'Invoice',
            description: 'Schema for invoice processing',
            properties: [
                // Invoice details
                new StringSchema(name: 'invoice_number', description: 'The invoice number from the document'),
                new StringSchema(name: 'invoice_title', description: 'The main subject of the invoice/receipt in 1-3 words. Format should be a noun or noun phrase like "Office Supplies", "Restaurant Bill", "Software License", etc'),
                new StringSchema(name: 'invoice_description', description: 'A short description of the invoice/receipt. Format should be a sentence or two describing the purpose of the invoice/receipt. For example, "Paper for printer", "Dinner at XYZ", "Adobe Photoshop subscription", etc'),
                new StringSchema(name: 'invoice_date', description: 'The date of the invoice/receipt. Format should be YYYY-MM-DD. For example, "2023-03-15"'),

                // Sender details
                new StringSchema(name: 'sender_company_name', description: 'The name of the company or individual sending the invoice/receipt.'),
                new StringSchema(name: 'sender_address', description: 'The address of the sender. Format should be a full address including street, city, state, and zip code. For example, "123 Main St, Springfield, IL 62701"'),
                new StringSchema(name: 'sender_email', description: 'The email address of the sender.'),
                new StringSchema(name: 'sender_tax_number', description: 'The tax/VAT identification number of the sender. Format should be a string of numbers and letters. For example, "AB123456789"'),

                // Recipient details
                new StringSchema(name: 'recipient_company_name', description: 'The name of the company or individual receiving the invoice/receipt.'),
                new StringSchema(name: 'recipient_address', description: 'The address of the recipient. Format should be a full address including street, city, state, and zip code. For example, "456 Elm St, Springfield, IL 62701"'),
                new StringSchema(name: 'recipient_tax_number', description: 'The tax/VAT identification number of the recipient. Format should be a string of numbers and letters. For example, "CD987654321"'),

                // Financial details
                new NumberSchema('subtotal', description: 'The subtotal amount before tax and discounts. Format should be a number without decimal places. e.g., "1000" for $10.00, "2790" for $27.90'),
                new NumberSchema('tax_rate', description: 'The tax rate applied to the subtotal. Format should be a number without decimal places. e.g., "1900" for 19%, "500" for 5%'),
                new NumberSchema('tax_amount', description: 'The total tax amount applied to the subtotal. Format should be a number without decimal places. e.g., "190" for $1.90, "500" for $5.00'),
                new NumberSchema('discount', description: 'The total discount amount applied to the subtotal. Format should be a number without decimal places. e.g., "100" for $1.00, "500" for $5.00'),
                new NumberSchema('total', description: 'The total amount after tax and discounts. Format should be a number without decimal places. e.g., "1000" for $10.00, "2790" for $27.90'),
                new StringSchema(name: 'currency', description: 'The currency of the amounts. Format should be a 3-letter ISO 4217 currency code. For example, "USD" for US dollars, "EUR" for euros'),

                // Additional information
                new StringSchema(name: 'notes', description: 'Any additional notes or comments on the invoice/receipt.'),
                new StringSchema(name: 'payment_terms', description: 'The payment terms and conditions. Format should be a string describing the payment terms. For example, "Net 30 days", "Due on receipt", etc'),

                // Full text extraction
                new StringSchema(name: 'extracted_text', description: 'The full text extracted from the invoice/receipt in markdown format. This is the raw text extracted from the image. Format should be a string containing the full text, tables and formatting.'),

                // Confidence score
                new NumberSchema('confidence', description: 'The confidence score of the OCR process. Format should be a number between 0 and 100. e.g., "95" for 95% confidence'),
            ],
            requiredFields: [
                'invoice_number',
                'invoice_title',
                'invoice_description',
                'invoice_date',
                'sender_company_name',
                'sender_address',
                'total',
                'currency',
                'extracted_text',
                'confidence',
            ],
        );

        // Prompt for structured data extraction
        $prompt = "Extract all available invoice information from this document in two formats:

1. As structured data:
- Invoice numbers and dates (use YYYY-MM-DD format for dates)
- Company details (both sender and recipient)
- Financial information (convert all amounts to cents by removing decimal point and trailing zeros)
- Tax information
- Payment terms and additional notes

Today's date is ".date('Y-m-d')." - use this as reference when interpreting relative dates.

For amounts, convert to cents by removing decimal point and any trailing zeros. Examples:
- €27,90 → enter 2790 (not 279000)
- €5,30 → enter 530 (not 53000)
- €33,20 → enter 3320 (not 332000)

2. As complete markdown text:
Return only the markdown with no explanation text. Do not include delimiters like '''markdown or '''.

RULES:
	- You must include all information on the page. Do not exclude headers, footers, or subtext.
    - Logos must be replaced with 'logo:' followed by a title. Ex: Coca Cola logo becomes 'logo: Coca cola'.
    - Images without text must be replaced with 'image:' followed by a short description of the image.
    - Create a table whenever possible. Use the first row as the header.
	- Charts & infographics must be interpreted to a valid markdown format. Prefer table format when applicable.
	- For tables with double headers, prefer adding a new column.
	- Prefer using ☐ and ☑ for check boxes.";

        // Include image path in the prompt
        $message = new UserMessage(
            $prompt,
            [Image::fromPath($imagePath)]
        );

        Log::info('Sending image to Prism for processing', [
            'invoice_id' => $this->invoice->id,
            'image_path' => $imagePath,
        ]);

        // Send to AI API endpoint for processing
        $response = Prism::structured()
            ->using(Provider::OpenAI, 'gpt-4o-mini')
            ->withSchema($schema)
            ->usingTemperature(0)
            ->withMessages([$message])
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
            $this->invoice->save();

        } else {
            Log::error('No structured response received from Prism', [
                'invoice_id' => $this->invoice->id,
            ]);
        }
    }
}
