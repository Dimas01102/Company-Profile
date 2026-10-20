<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\ActivityLog
 */
class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'timestamp' => $this->created_at?->toIso8601String(),
            'admin' => $this->admin_name,
            'action' => $this->action,
            'module' => $this->module,
            'description' => $this->description,
            'affected_data' => $this->affected_data,
            'status' => $this->status,
        ];
    }
}
