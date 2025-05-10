<?php

namespace App\Prompts;

class InvoicePrompt
{
    public static function getPrompt(): string
    {
        return "Extract all available invoice information from this document in two formats:

1. As structured data:
- Invoice numbers and dates (use YYYY-MM-DD format for dates; if a date is not found or not applicable, use null)
- Company details (both sender and recipient)
- Financial information (convert all amounts to cents by removing decimal point and trailing zeros)
- Tax information
- Payment terms and additional notes

Today's date is ".date('Y-m-d')." - use this as reference when interpreting relative dates.

For amounts, convert to cents by removing decimal point and any trailing zeros. Examples:
- €27,90 → enter 2790 (not 279000)
- €5,30 → enter 530 (not 53000)
- €33,20 → enter 3320 (not 332000)

**IMPORTANT: If the document is clearly not an invoice or receipt (e.g., it is a photo, a drawing, a random text document), set `invoice_title` to the exact string 'The image is not an invoice/receipt'. In this case, use `invoice_description` to briefly describe the actual content of the image (e.g., 'A photograph of a cat', 'A landscape drawing', 'A page from a book with no financial details'). For date fields (like 'invoice_date') where no relevant date can be extracted, provide null. For numerical financial fields, use 0. For other string fields (like 'invoice_number') where information is not applicable, use 'N/A'.**

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
    }
}
