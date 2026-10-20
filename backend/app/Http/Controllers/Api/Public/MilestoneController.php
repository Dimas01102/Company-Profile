<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\MilestoneResource;
use App\Models\Milestone;
use App\Support\ApiResponse;

class MilestoneController extends Controller
{
    /** GET /api/milestones only milestones marked active. */
    public function index()
    {
        return ApiResponse::success(
            MilestoneResource::collection(Milestone::active()->ordered()->get()),
        );
    }
}
