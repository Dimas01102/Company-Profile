<?php

use App\Http\Controllers\Api\Admin\ActivityLogController;
use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\CompanyProfileController as AdminCompanyProfileController;
use App\Http\Controllers\Api\Admin\EmployeeController as AdminEmployeeController;
use App\Http\Controllers\Api\Admin\GalleryItemController as AdminGalleryItemController;
use App\Http\Controllers\Api\Admin\InquiryController as AdminInquiryController;
use App\Http\Controllers\Api\Admin\MilestoneController as AdminMilestoneController;
use App\Http\Controllers\Api\Admin\NewsController as AdminNewsController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Api\Public\BannerController;
use App\Http\Controllers\Api\Public\CategoryController;
use App\Http\Controllers\Api\Public\CompanyProfileController;
use App\Http\Controllers\Api\Public\EmployeeController;
use App\Http\Controllers\Api\Public\GalleryController;
use App\Http\Controllers\Api\Public\InquiryController;
use App\Http\Controllers\Api\Public\MilestoneController;
use App\Http\Controllers\Api\Public\NewsController;
use App\Http\Controllers\Api\Public\ProductController;
use App\Http\Controllers\Api\Public\SettingsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Registered with the "api" middleware group and the "/api" prefix
| automatically (see bootstrap/app.php -> withRouting).
|
| Visitors have no account, so every public read endpoint below is
| unauthenticated by design. Only the /admin/* namespace requires a
| Sanctum bearer token, issued by POST /api/admin/login.
|
*/

Route::prefix('admin')->name('admin.')->group(function () {

    // --- authentication ----------------------------------
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:login')
        ->name('login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::get('/me', [AuthController::class, 'me'])->name('me');
        Route::put('/profile', [AuthController::class, 'updateProfile'])->name('profile.update');
        Route::put('/password', [AuthController::class, 'changePassword'])->name('password.update');

        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // --- Company Profile + Milestones + Employees ---
        Route::get('/company-profile', [AdminCompanyProfileController::class, 'show'])->name('company-profile.show');
        Route::put('/company-profile', [AdminCompanyProfileController::class, 'update'])->name('company-profile.update');
        Route::post('/company-profile/resolve-map', [AdminCompanyProfileController::class, 'resolveMap'])->name('company-profile.resolve-map');

        Route::get('/milestones', [AdminMilestoneController::class, 'index'])->name('milestones.index');
        Route::post('/milestones', [AdminMilestoneController::class, 'store'])->name('milestones.store');
        Route::put('/milestones/{milestone}', [AdminMilestoneController::class, 'update'])->name('milestones.update');
        Route::delete('/milestones/{milestone}', [AdminMilestoneController::class, 'destroy'])->name('milestones.destroy');
        Route::patch('/milestones/{milestone}/reorder', [AdminMilestoneController::class, 'reorder'])->name('milestones.reorder');

        Route::get('/employees', [AdminEmployeeController::class, 'index'])->name('employees.index');
        Route::post('/employees', [AdminEmployeeController::class, 'store'])->name('employees.store');
        Route::get('/employees/{employee}', [AdminEmployeeController::class, 'show'])->name('employees.show');
        Route::put('/employees/{employee}', [AdminEmployeeController::class, 'update'])->name('employees.update');
        Route::delete('/employees/{employee}', [AdminEmployeeController::class, 'destroy'])->name('employees.destroy');
        Route::patch('/employees/{employee}/reorder', [AdminEmployeeController::class, 'reorder'])->name('employees.reorder');

        // --- Categories + Products -----------------------
        Route::get('/categories', [AdminCategoryController::class, 'index'])->name('categories.index');
        Route::post('/categories', [AdminCategoryController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}', [AdminCategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy'])->name('categories.destroy');
        Route::patch('/categories/{category}/reorder', [AdminCategoryController::class, 'reorder'])->name('categories.reorder');

        Route::get('/products', [AdminProductController::class, 'index'])->name('products.index');
        Route::post('/products', [AdminProductController::class, 'store'])->name('products.store');
        Route::get('/products/{product}', [AdminProductController::class, 'show'])->name('products.show');
        Route::put('/products/{product}', [AdminProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [AdminProductController::class, 'destroy'])->name('products.destroy');
        Route::get('/products/{product}/related', [AdminProductController::class, 'related'])->name('products.related');

        // --- News Management ------------------------------
        Route::get('/news', [AdminNewsController::class, 'index'])->name('news.index');
        Route::post('/news', [AdminNewsController::class, 'store'])->name('news.store');
        Route::get('/news/{news}', [AdminNewsController::class, 'show'])->name('news.show');
        Route::put('/news/{news}', [AdminNewsController::class, 'update'])->name('news.update');
        Route::delete('/news/{news}', [AdminNewsController::class, 'destroy'])->name('news.destroy');
        Route::patch('/news/{news}/status', [AdminNewsController::class, 'updateStatus'])->name('news.status');

        // --- Gallery + Banner Management -----------------
        Route::get('/gallery', [AdminGalleryItemController::class, 'index'])->name('gallery.index');
        Route::post('/gallery', [AdminGalleryItemController::class, 'store'])->name('gallery.store');
        Route::put('/gallery/{galleryItem}', [AdminGalleryItemController::class, 'update'])->name('gallery.update');
        Route::delete('/gallery/{galleryItem}', [AdminGalleryItemController::class, 'destroy'])->name('gallery.destroy');
        Route::patch('/gallery/{galleryItem}/reorder', [AdminGalleryItemController::class, 'reorder'])->name('gallery.reorder');

        Route::get('/banners', [AdminBannerController::class, 'index'])->name('banners.index');
        Route::post('/banners', [AdminBannerController::class, 'store'])->name('banners.store');
        Route::put('/banners/{banner}', [AdminBannerController::class, 'update'])->name('banners.update');
        Route::delete('/banners/{banner}', [AdminBannerController::class, 'destroy'])->name('banners.destroy');
        Route::patch('/banners/{banner}/reorder', [AdminBannerController::class, 'reorder'])->name('banners.reorder');

        // --- Inquiry Management ---------------------------
        Route::get('/inquiries', [AdminInquiryController::class, 'index'])->name('inquiries.index');
        Route::get('/inquiries/{inquiry}', [AdminInquiryController::class, 'show'])->name('inquiries.show');
        Route::patch('/inquiries/{inquiry}/status', [AdminInquiryController::class, 'updateStatus'])->name('inquiries.status');
        Route::post('/inquiries/{inquiry}/notes', [AdminInquiryController::class, 'addNote'])->name('inquiries.notes');
        Route::delete('/inquiries/{inquiry}', [AdminInquiryController::class, 'destroy'])->name('inquiries.destroy');

        // --- Website Settings + Activity Logs -----------
        Route::get('/settings', [AdminSettingsController::class, 'show'])->name('settings.show');
        Route::put('/settings', [AdminSettingsController::class, 'update'])->name('settings.update');
        Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');

    });
});

// --- Public catalog / content endpoints -----------------------------------
Route::get('company-profile', [CompanyProfileController::class, 'show']);
Route::get('milestones', [MilestoneController::class, 'index']);
Route::get('employees', [EmployeeController::class, 'index']);
Route::get('categories', [CategoryController::class, 'index']);
Route::get('products', [ProductController::class, 'index']);
Route::get('products/{slug}', [ProductController::class, 'show']);
Route::get('news', [NewsController::class, 'index']);
Route::get('news/{slug}', [NewsController::class, 'show']);
Route::get('gallery', [GalleryController::class, 'index']);
Route::get('banners', [BannerController::class, 'index']);
Route::get('settings', [SettingsController::class, 'show']);

Route::post('inquiries', [InquiryController::class, 'store'])->middleware('throttle:public-write');
Route::post('contact', [InquiryController::class, 'contact'])->middleware('throttle:public-write');
