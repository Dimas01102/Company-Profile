<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\GalleryItem
 */
class GalleryItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'caption' => $this->caption,
            'image' => asset('storage/'.$this->image_path),
            'album' => $this->album,
            'tags' => implode(', ', $this->tags ?? []),
            'date' => $this->date?->toDateString(),
            'order' => $this->order,
            'status' => $this->status,
            'is_video' => $this->is_video,
            'video_duration' => $this->video_duration,
        ];
    }
}
