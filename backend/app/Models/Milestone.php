<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Milestone extends Model
{
    use HasFactory;

    protected $fillable = ['year', 'title', 'description', 'image_path', 'order', 'active'];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }

    public function scopeActive(Builder $query)
    {
        return $query->where('active', true);
    }

    public function scopeOrdered(Builder $query)
    {
        return $query->orderBy('order');
    }
}
