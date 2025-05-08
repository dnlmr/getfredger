<?php

use App\Enums\InvoiceStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();

            // User and Team relationship
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('team_id')->nullable()->constrained()->onDelete('cascade');

            // Invoice Details
            $table->string('filename');
            $table->string('invoice_number')->nullable();
            $table->string('invoice_title')->nullable();
            $table->string('invoice_description')->nullable();
            $table->date('invoice_date')->nullable();
            $table->enum('status', array_column(InvoiceStatus::cases(), 'value'))
                ->default(InvoiceStatus::DRAFT->value);

            // Sender Details
            $table->string('sender_company_name')->nullable();
            $table->text('sender_address')->nullable();
            $table->string('sender_email')->nullable();
            $table->string('sender_tax_number')->nullable();

            // Recipient Details
            $table->string('recipient_company_name')->nullable();
            $table->text('recipient_address')->nullable();
            $table->string('recipient_tax_number')->nullable();

            // Financial Details
            $table->unsignedBigInteger('subtotal')->nullable();
            $table->unsignedInteger('tax_rate')->nullable(); // Store as integer (e.g., 1900 for 19%)
            $table->unsignedBigInteger('tax_amount')->nullable();
            $table->string('discount')->nullable();
            $table->unsignedBigInteger('total')->nullable();
            $table->string('currency')->default('EUR');

            // Additional Information
            $table->text('notes')->nullable();
            $table->text('payment_terms')->nullable();
            $table->text('extracted_text')->nullable();

            // Token usage & model
            $table->string('prompt_tokens')->nullable();
            $table->string('completion_tokens')->nullable();
            $table->string('model')->nullable();

            // Confidence score
            $table->unsignedInteger('confidence')->nullable();

            // Payment Details
            $table->dateTime('paid_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
