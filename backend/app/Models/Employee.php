<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_code', 'name', 'position', 'department', 'email', 'phone', 'photo_path',
        'short_bio', 'full_bio', 'responsibilities', 'experience', 'linkedin', 'order', 'status',
    ];

    protected function casts(): array
    {
        return [
            'responsibilities' => 'array',
            'experience' => 'array',
        ];
    }

    public function scopeActive(Builder $query)
    {
        return $query->where('status', 'Active');
    }

    public function scopeOrdered(Builder $query)
    {
        return $query->orderBy('order');
    }
}
