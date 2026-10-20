<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Default API rate limit: generous for browsing the public catalog.
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });

        // Tighter limit specifically for the admin login endpoint to slow
        // down credential-stuffing / brute-force attempts.
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // Public write endpoint (inquiry / contact submission), generous
        // enough for real visitors, tight enough to blunt form spam bots.
        RateLimiter::for('public-write', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });
    }
}
