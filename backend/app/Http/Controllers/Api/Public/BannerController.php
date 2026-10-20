<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use App\Support\ApiResponse;

class BannerController extends Controller
{
    /** GET /api/banners, only Active banners within their date window. */
    public function index()
    {
        return ApiResponse::success(
            BannerResource::collection(Banner::currentlyActive()->ordered()->get()),
        );
    }
}
