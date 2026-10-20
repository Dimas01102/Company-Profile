<?php

return [

    'defaults' => [
        'guard' => 'sanctum',
        'passwords' => 'admins',
    ],

    'guards' => [
        // Bearer-token guard used by every protected /api/admin/* route.
        // Sanctum resolves the token to its owning model (Admin) directly,
        // so no explicit "provider" is required here.
        'sanctum' => [
            'driver' => 'sanctum',
            'provider' => 'admins',
        ],
    ],

    'providers' => [
        'admins' => [
            'driver' => 'eloquent',
            'model' => App\Models\Admin::class,
        ],
    ],

    'passwords' => [
        'admins' => [
            'provider' => 'admins',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,

];
