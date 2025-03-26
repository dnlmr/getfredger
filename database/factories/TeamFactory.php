<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Team>
 */
class TeamFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->sentence(2),
            'user_id' => User::factory(),
            'personal_team' => false, // All factory-created teams are not personal by default
        ];
    }

    /**
     * Indicate that the team is personal.
     */
    public function withPersonalTeam(): static
    {
        return $this->state(fn (array $attributes) => [
            'personal_team' => true,
        ]);
    }
}
