<?php

namespace App\Schemas;

use Prism\Prism\Schema\NumberSchema;
use Prism\Prism\Schema\ObjectSchema;
use Prism\Prism\Schema\StringSchema;

class InvoiceSchema
{
    public static function getSchema(): ObjectSchema
    {
        return new ObjectSchema(
            name: 'Invoice',
            description: 'Schema for invoice processing',
            properties: [
                // Invoice details
                new StringSchema(
                    name: 'invoice_number',
                    description: 'The invoice number from the document. If you cannot find it, use "N/A"',
                    nullable: true
                ),
                new StringSchema(
                    name: 'invoice_title',
                    description: 'The main subject of the invoice/receipt in 1-3 words. Format should be a noun or noun phrase like "Office Supplies", "Restaurant Bill", "Software License", etc',
                ),
                new StringSchema(
                    name: 'invoice_description',
                    description: 'A short description of the invoice/receipt. Format should be a sentence or two describing the purpose of the invoice/receipt. For example, "Paper for printer", "Dinner at XYZ", "Adobe Photoshop subscription", etc',
                ),
                new StringSchema(
                    name: 'invoice_date',
                    description: 'The date of the invoice/receipt. Format should be YYYY-MM-DD. For example, "2023-03-15"',
                    nullable: true
                ),

                // Sender details
                new StringSchema(
                    name: 'sender_company_name',
                    description: 'The name of the company or individual sending the invoice/receipt.',
                    nullable: true
                ),
                new StringSchema(
                    name: 'sender_address',
                    description: 'The address of the sender. Format should be a full address including street, city, state, and zip code. For example, "123 Main St, Springfield, IL 62701"',
                    nullable: true
                ),
                new StringSchema(
                    name: 'sender_email',
                    description: 'The email address of the sender.',
                    nullable: true
                ),
                new StringSchema(
                    name: 'sender_tax_number',
                    description: 'The tax/VAT identification number of the sender. Format should be a string of numbers and letters. For example, "AB123456789"',
                    nullable: true
                ),

                // Recipient details
                new StringSchema(
                    name: 'recipient_company_name',
                    description: 'The name of the company or individual receiving the invoice/receipt.',
                    nullable: true
                ),
                new StringSchema(
                    name: 'recipient_address',
                    description: 'The address of the recipient. Format should be a full address including street, city, state, and zip code. For example, "456 Elm St, Springfield, IL 62701"',
                    nullable: true
                ),
                new StringSchema(
                    name: 'recipient_tax_number',
                    description: 'The tax/VAT identification number of the recipient. Format should be a string of numbers and letters. For example, "CD987654321"',
                    nullable: true
                ),

                // Financial details
                new NumberSchema(
                    name: 'subtotal',
                    description: 'The subtotal amount before tax and discounts. Format should be a number without decimal places. e.g., "1000" for $10.00, "2790" for $27.90',
                    nullable: true
                ),
                new NumberSchema(
                    name: 'tax_rate',
                    description: 'The tax rate applied to the subtotal. Format should be a number without decimal places. e.g., "1900" for 19%, "500" for 5%',
                    nullable: true
                ),
                new NumberSchema(
                    name: 'tax_amount',
                    description: 'The total tax amount applied to the subtotal. Format should be a number without decimal places. e.g., "190" for $1.90, "500" for $5.00',
                    nullable: true
                ),
                new NumberSchema(
                    name: 'discount',
                    description: 'The total discount amount applied to the subtotal. The value must be a positive integer (no decimal places). If the extracted value is negative, it should be converted to its absolute positive equivalent. For example, "100" for $1.00, and if "-$5.00" is extracted, it should be represented as "500".',
                    nullable: true
                ),
                new NumberSchema(
                    name: 'total',
                    description: 'The total amount after tax and discounts. Format should be a number without decimal places. e.g., "1000" for $10.00, "2790" for $27.90',
                    nullable: true
                ),
                new StringSchema(
                    name: 'currency',
                    description: 'The currency of the amounts. Format should be a 3-letter ISO 4217 currency code. For example, "USD" for US dollars, "EUR" for euros',
                    nullable: true
                ),

                // Additional information
                new StringSchema(
                    name: 'notes',
                    description: 'Any additional notes or comments on the invoice/receipt.',
                    nullable: true
                ),
                new StringSchema(
                    name: 'payment_terms',
                    description: 'The payment terms and conditions. Format should be a string describing the payment terms. For example, "Net 30 days", "Due on receipt", etc',
                    nullable: true
                ),

                // Full text extraction
                new StringSchema(
                    name: 'extracted_text',
                    description: 'The full text extracted from the invoice/receipt in markdown format. This is the raw text extracted from the image. Format should be a string containing the full text, tables and formatting.'),

                // Confidence score
                new NumberSchema(
                    name: 'confidence',
                    description: 'The confidence score of the OCR process. How confident is the AI that the extracted data is correct? 0 means not confident at all, 100 means very confident. Format should be a number between 0 and 100.'),
            ],
            requiredFields: [
                'invoice_title',
                'invoice_description',
                'extracted_text',
                'confidence',
            ],
        );
    }
}
