<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Inquiry
 */
class InquiryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'company' => $this->company,
            'email' => $this->email,
            'phone' => $this->phone,
            'subject' => $this->subject,
            'message' => $this->message,
            'source' => $this->source,
            'product' => $this->whenLoaded('product', fn () => $this->product?->name),
            'date' => $this->created_at?->toIso8601String(),
            'status' => $this->status,
            'notes' => InquiryNoteResource::collection($this->whenLoaded('notes')),
        ];
    }
}
