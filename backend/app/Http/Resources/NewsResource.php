<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\News
 */
class NewsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'category' => $this->category,
            'author' => $this->author,
            'date' => $this->published_date?->toDateString(),
            'read_time' => $this->read_time,
            'summary' => $this->summary,
            'content' => $this->content,
            'thumbnail' => $this->thumbnail_path ? asset('storage/'.$this->thumbnail_path) : null,
            'gallery' => $this->whenLoaded('galleryImages', fn () => $this->galleryImages->map(fn ($g) => [
                'id' => $g->id,
                'url' => asset('storage/'.$g->image_path),
            ])),
            // Stored as a JSON array; exposed as a comma-separated string
            // to match the admin console's editable text field.
            'tags' => implode(', ', $this->tags ?? []),
            'featured' => $this->featured,
            'status' => $this->status,
            // "Y-m-d\TH:i" in the app timezone: the exact format a datetime-local input expects.
            'scheduled_at' => $this->scheduled_at?->format('Y-m-d\TH:i'),
            'is_live' => $this->isLive(),
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'meta_keywords' => $this->meta_keywords,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
