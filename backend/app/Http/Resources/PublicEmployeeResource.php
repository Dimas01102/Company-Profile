<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * What the public website may know about an employee. Internal fields
 * (employee code, email, phone) stay in the admin-only EmployeeResource.
 *
 * @mixin \App\Models\Employee
 */
class PublicEmployeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'position' => $this->position,
            'department' => $this->department,
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
