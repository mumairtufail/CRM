<?php

namespace Database\Factories;

use App\Models\Lead;
use Illuminate\Database\Eloquent\Factories\Factory;

class LeadFactory extends Factory
{
    protected $model = Lead::class;

    public function definition(): array
    {
        $statuses   = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
        $sources    = ['manual', 'csv', 'claude_ai', 'apollo', 'google_sheet'];
        $industries = ['Software', 'Marketing Agency', 'E-commerce', 'Healthcare', 'Finance', 'Real Estate', 'Education'];

        return [
            'first_name'        => fake()->firstName(),
            'last_name'         => fake()->lastName(),
            'company'           => fake()->company(),
            'job_title'         => fake()->jobTitle(),
            'website'           => fake()->url(),
            'linkedin_url'      => 'https://linkedin.com/in/' . fake()->userName(),
            'notes'             => fake()->optional(0.4)->paragraph(),
            'source'            => fake()->randomElement($sources),
            'status'            => fake()->randomElement($statuses),
            'priority'          => fake()->randomElement(['low', 'medium', 'high']),
            'deal_value'        => fake()->optional(0.7)->numberBetween(500, 50000),
            'country'           => fake()->country(),
            'city'              => fake()->city(),
            'industry'          => fake()->randomElement($industries),
            'last_contacted_at' => fake()->optional(0.6)->dateTimeBetween('-3 months', 'now'),
            'follow_up_at'      => fake()->optional(0.4)->dateTimeBetween('now', '+1 month'),
        ];
    }
}
