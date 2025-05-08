<?php

namespace Database\Factories;

use App\Enums\InvoiceStatus;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invoice>
 */
class InvoiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'user_id' => User::factory(),
            'filename' => $this->faker->word() . '.pdf',
            'invoice_number' => $this->faker->unique()->numerify('INV-######'),
            'invoice_title' => $this->faker->sentence(3),
            'invoice_description' => $this->faker->optional()->paragraph,
            'invoice_date' => $this->faker->dateTimeThisMonth(),
            'status' => $this->faker->randomElement(InvoiceStatus::cases()),
            'sender_company_name' => $this->faker->company,
            'sender_address' => $this->faker->address,
            'sender_email' => $this->faker->companyEmail,
            'sender_tax_number' => $this->faker->optional()->bothify('??#########'),
            'recipient_company_name' => $this->faker->company,
            'recipient_address' => $this->faker->address,
            'recipient_tax_number' => $this->faker->optional()->bothify('??#########'),
            'subtotal' => $this->faker->numberBetween(800, 40000), // Amount in cents
            'tax_rate' => $this->faker->randomElement([null, 1900, 700]), // e.g., 1900 for 19%
            'tax_amount' => function (array $attributes) {
                if (is_null($attributes['subtotal']) || is_null($attributes['tax_rate'])) {
                    return null;
                }
                return (int) ($attributes['subtotal'] * ($attributes['tax_rate'] / 10000));
            },
            'discount' => $this->faker->optional()->numberBetween(100, 5000), // Amount in cents
            'total' => function (array $attributes) {
                $total = $attributes['subtotal'] ?? 0;
                if (isset($attributes['tax_amount'])) {
                    $total += $attributes['tax_amount'];
                }
                if (isset($attributes['discount'])) {
                    $total -= $attributes['discount'];
                }
                return max(0, $total);
            },
            'currency' => 'EUR',
            'notes' => $this->faker->optional()->sentence,
            'payment_terms' => $this->faker->optional()->sentence,
            'extracted_text' => $this->faker->optional()->text,
            'prompt_tokens' => $this->faker->optional()->numberBetween(100, 1000),
            'completion_tokens' => $this->faker->optional()->numberBetween(50, 500),
            'confidence' => $this->faker->optional()->numberBetween(70, 100),
            'paid_at' => null,
        ];
    }
}
