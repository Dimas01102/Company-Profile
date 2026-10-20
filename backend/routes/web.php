<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| This backend is an API-only service consumed by the separate TanStack
| Start frontend (see ../frontend). There is intentionally no Blade UI
| here beyond a simple landing response for anyone who hits the root.
|
*/

Route::get('/', function () {
    return response()->json([
        'service' => config('app.name'),
        'status' => 'ok',
        'docs' => url('/api'),
    ]);
});

/*
|--------------------------------------------------------------------------
| Public file fallback (/storage/...)
|--------------------------------------------------------------------------
|
| Uploaded images and PDFs live in storage/app/public and are normally
| served straight by the web server through the public/storage symlink
| (`php artisan storage:link`). On Windows / Laragon that symlink is often
| missing (creating it needs administrator rights) or gets lost when the
| project is copied or zipped, every uploaded photo then 404s even though
| the upload itself succeeded.
|
| When the symlink exists the web server answers first and this route is
| never reached. When it does not, Laravel streams the file instead, so
| photos always load. The session/CSRF middleware is skipped on purpose:
| this is a stateless file response.
|
*/
Route::get('/storage/{path}', function (string $path) {
    /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
    $disk = Storage::disk('public');

    abort_if(str_contains($path, '..'), 404);
    abort_unless($disk->exists($path), 404);

    return $disk->response($path, null, ['Cache-Control' => 'public, max-age=86400']);
})
    ->where('path', '.*')
    ->withoutMiddleware([
        \Illuminate\Cookie\Middleware\EncryptCookies::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
        \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ]);
