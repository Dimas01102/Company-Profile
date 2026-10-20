<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CompanyProfileResource;
use App\Models\CompanyProfile;
use App\Support\ApiResponse;

class CompanyProfileController extends Controller
{
    /** GET /api/company-profile */
    public function show()
    {
        $profile = CompanyProfile::current()->load('coreValues');

        return ApiResponse::success(new CompanyProfileResource($profile));
    }
}
