<?php

namespace App\Enums;

enum InvoiceStatus: string
{
    case UPLOADED = 'uploaded';
    case NO_INVOICE = 'no_invoice';
    case PROCESSED = 'processed';
    case SENT = 'sent';
    case PAID = 'paid';
    case OVERDUE = 'overdue';
    case CANCELLED = 'cancelled';

    public function getLabel(): string
    {
        return match ($this) {
            self::UPLOADED => 'Uploaded',
            self::NO_INVOICE => 'No Invoice',
            self::PROCESSED => 'Processed',
            self::SENT => 'Sent',
            self::PAID => 'Paid',
            self::OVERDUE => 'Overdue',
            self::CANCELLED => 'Cancelled',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::UPLOADED => 'blue',
            self::NO_INVOICE => 'red',
            self::PROCESSED => 'gray',
            self::SENT => 'blue',
            self::PAID => 'green',
            self::OVERDUE => 'red',
            self::CANCELLED => 'yellow',
        };
    }
}
