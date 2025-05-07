<?php

namespace App\Models;

use App\Enums\InvoiceStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Invoice extends Model implements HasMedia
{
    /** @use HasFactory<\Database\Factories\InvoiceFactory> */
    use HasFactory, InteractsWithMedia;

    protected $guarded = [];

    protected $casts = [
        'invoice_date' => 'date',
        'paid_at' => 'datetime',
        'tags' => 'array',
        'status' => InvoiceStatus::class,
    ];

    protected $dates = [
        'invoice_date',
        'paid_at',
    ];

    /**
     * Get the user that owns the invoice.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the team that owns the invoice.
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Getters and setters for currency amounts are disabled for now
     * Some currencies have more than two decimal places, see ISO 4217
     *
     * @see https://en.wikipedia.org/wiki/ISO_4217
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('vision-optimized')
            ->format('png')
            ->width(3000)
            ->height(3000)
            ->greyscale()
            ->brightness(5)
            ->contrast(10)
            ->sharpen(15)
            ->width(1024)
            ->height(1024)
            ->queued();
    }
}
