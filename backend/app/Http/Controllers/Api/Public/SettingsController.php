<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\WebsiteSettingsResource;
use App\Models\WebsiteSetting;
use App\Support\ApiResponse;

class SettingsController extends Controller
{
    /** GET /api/settings homepage hero, section visibility, footer content. */
    public function show()
    {
        $settings = WebsiteSetting::current()->load('footerLinks');

        return ApiResponse::success(new WebsiteSettingsResource($settings));
    }
}
