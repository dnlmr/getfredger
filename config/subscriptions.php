<?php

return [
    'plans' => [
        'monthly' => [
            'name' => 'Fredger Pro Monthly',
            'plan_id' => env('FREDGER_PRO_MONTHLY_ID'),
            'price' => '900',
            'max_monthly_credits' => 100,
        ],
        'yearly' => [
            'name' => 'Fredger Pro Yearly',
            'plan_id' => env('FREDGER_PRO_YEARLY_ID'),
            'price' => '9900',
            'max_monthly_credits' => 100,
        ],
        'yearly_believer' => [
            'name' => 'Fredger Pro Believer',
            'plan_id' => env('FREDGER_PRO_BELIEVER_YEARLY_ID'),
            'price' => '4900',
            'max_monthly_credits' => 100,
        ],
    ],
];
