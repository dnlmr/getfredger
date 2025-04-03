<?php

return [
    'plans' => [
        'monthly' => [
            'name' => 'Monthly',
            'plan_id' => env('FREDGER_BELIEVER_MONTHLY_ID'),
            'price' => '900',
        ],
        'yearly_believer' => [
            'name' => 'Yearly Believer',
            'plan_id' => env('FREDGER_BELIEVER_YEARLY_ID'),
            'price' => '4900',
        ],
    ],
];
