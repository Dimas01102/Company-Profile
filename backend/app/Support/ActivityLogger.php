<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\Admin;
use Illuminate\Support\Facades\Auth;

class ActivityLogger
{
    public static function log(
        string $action,
        string $module,
        string $description,
        ?string $affectedData = null,
        string $status = 'Success',
        ?Admin $actor = null,
    ): void {
        $admin = $actor ?? Auth::guard('sanctum')->user();

        ActivityLog::create([
            'admin_id' => $admin?->id,
            'admin_name' => $admin?->name ?? 'System',
            'action' => $action,
            'module' => $module,
            'description' => $description,
            'affected_data' => $affectedData,
            'status' => $status,
        ]);
    }
}
