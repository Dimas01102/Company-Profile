<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
     * Only the admin console's own origin(s) may make credentialed
     * requests. The public read-only endpoints are also same-listed here
     * because the storefront frontend calls the same API.
     */
    'allowed_origins' => array_filter(explode(',', env(
        'CORS_ALLOWED_ORIGINS',
        env('FRONTEND_URL', implode(',', [
            'http://localhost:5173', 'http://127.0.0.1:5173',
            'http://localhost:3000', 'http://127.0.0.1:3000',
            'http://localhost:8080', 'http://127.0.0.1:8080',
            'http://localhost:4173', 'http://127.0.0.1:4173',
        ]))
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
