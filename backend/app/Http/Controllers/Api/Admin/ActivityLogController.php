<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityLogResource;
use App\Models\ActivityLog;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /** GET /api/admin/activity-logs?search=&module=&date_from=&date_to=&per_page= */
    public function index(Request $request)
    {
        $query = ActivityLog::query();

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('affected_data', 'like', "%{$search}%")
                    ->orWhere('admin_name', 'like', "%{$search}%");
            });
        }

        if ($module = $request->string('module')->trim()->value()) {
            $query->where('module', $module);
        }

        if ($from = $request->string('date_from')->trim()->value()) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to = $request->string('date_to')->trim()->value()) {
            $query->whereDate('created_at', '<=', $to);
        }

        $logs = $query->latest()->paginate($request->integer('per_page', 10));

        return ApiResponse::success(
            ActivityLogResource::collection($logs),
            meta: [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'total' => $logs->total(),
            ],
        );
    }
}
