<?php

use Laravel\Sanctum\Sanctum;

return [

    /*
     * Domains allowed to authenticate against the API using cookie-based
     * (SPA) sessions instead of bearer tokens. The admin console runs on
     * one of these origins during local development.
     */
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,localhost:5173,127.0.0.1,127.0.0.1:8000,127.0.0.1:3000,127.0.0.1:5173,::1',
        Sanctum::currentApplicationUrlWithPort()
    ))),

    'guard' => ['web'],

    /*
     * Bearer-token expiration in minutes. Null means tokens never expire,
     * the admin console uses short-lived tokens instead, revoked on logout.
     */
    'expiration' => env('SANCTUM_TOKEN_EXPIRATION', 60 * 12),

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],

];
