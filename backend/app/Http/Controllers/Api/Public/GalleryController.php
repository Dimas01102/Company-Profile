<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\GalleryItemResource;
use App\Models\GalleryItem;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    /** GET /api/gallery?album=, only items marked Active. */
    public function index(Request $request)
    {
        $query = GalleryItem::query()->active()->ordered();

        if ($album = $request->string('album')->trim()->value()) {
            $query->where('album', $album);
        }

        return ApiResponse::success(GalleryItemResource::collection($query->get()));
    }
}
