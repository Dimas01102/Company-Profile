<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\ApiResponse;

class CategoryController extends Controller
{
    /** GET /api/categories only categories marked Active. */
    public function index()
    {
        return ApiResponse::success(
            CategoryResource::collection(
                Category::active()->withCount(['products' => fn ($q) => $q->published()])->ordered()->get(),
            ),
        );
    }
}
