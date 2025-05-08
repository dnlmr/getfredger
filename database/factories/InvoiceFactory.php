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
            'invoice_number' => $this->faker->unique()->numerify('INV-######'),
            'status' => $this->faker->randomElement(InvoiceStatus::cases()),
            'amount' => $this->faker->numberBetween(1000, 50000), // Amount in cents
            'invoice_date' => $this->faker->dateTimeThisMonth(),
            'due_date' => $this->faker->dateTimeThisMonth('+30 days'),
            'paid_at' => null,
            'notes' => $this->faker->optional()->sentence,
            'tags' => $this->faker->optional()->words(3),
        ];
    }
}
