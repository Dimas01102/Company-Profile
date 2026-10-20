<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Employee
 */
class EmployeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_code' => $this->employee_code,
            'name' => $this->name,
            'position' => $this->position,
            'department' => $this->department,
            'email' => $this->email,
            'phone' => $this->phone,
            'photo' => $this->photo_path ? asset('storage/'.$this->photo_path) : null,
            'short_bio' => $this->short_bio,
            'full_bio' => $this->full_bio,
            'responsibilities' => $this->responsibilities ?? [],
            'experience' => $this->experience ?? [],
            'linkedin' => $this->linkedin,
            'order' => $this->order,
            'status' => $this->status,
        ];
    }
}
