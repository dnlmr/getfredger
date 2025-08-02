<?php

namespace App\Models;

use App\Enums\InvoiceStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Image\Enums\BorderType;
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

    // PREVIOUS SETTINGS FOR MEDIA CONVERSIONS
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('vision-optimized')
            ->width(3000) // Prob. needed to work on local dev
            ->height(3000)
            ->greyscale()
            ->contrast(10)
            ->brightness(5)
            ->sharpen(15)
            // ->background('white') // new
            // ->border(1, BorderType::Expand, 'white') // new
            ->format('png')
            ->width(1024)
            ->height(1024)
            ->queued();
    }

    /**
     * Getters and setters for currency amounts are disabled for now
     * Some currencies have more than two decimal places, see ISO 4217
     *
     * @see https://en.wikipedia.org/wiki/ISO_4217
     */
    // public function registerMediaConversions(?Media $media = null): void
    // {
    //     $this->addMediaConversion('vision-optimized')
    //         ->greyscale() // Convert to grayscale first
    //         ->contrast(20) // Increase contrast for better text separation
    //         ->brightness(5) // Slight brightness boost
    //         ->sharpen(10) // Moderate sharpening (too high can introduce noise)
    //         ->background('white') // White background helps with text detection
    //         ->border(2, BorderType::Expand, 'white') // Expanded border preserves all content
    //         ->optimize() // General optimization
    //         ->format('png') // PNG is good for OCR (lossless)
    //         ->width(1024) // Higher resolution for better text capture
    //         ->height(1024) // Taller to preserve typical invoice layout
    //         ->queued();
    // }
}
