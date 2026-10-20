<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GalleryItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title', 'caption', 'image_path', 'album', 'tags', 'date', 'order',
        'status', 'is_video', 'video_duration',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'date' => 'date',
            'is_video' => 'boolean',
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
