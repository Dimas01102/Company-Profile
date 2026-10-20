<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\CompanyProfile
 */
class CompanyProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'name' => $this->name,
            'logo' => $this->logo_path ? asset('storage/'.$this->logo_path) : null,
            'tagline' => $this->tagline,
            'short_description' => $this->short_description,
            'full_description' => $this->full_description,

            'history' => $this->history,
            'founded_year' => $this->founded_year,
            'background' => $this->background,

            'vision' => $this->vision,
            'mission' => $this->mission,

            'business_type' => $this->business_type,
            'industry' => $this->industry,
            'business_scope' => $this->business_scope,
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,
            'postal_code' => $this->postal_code,
            'phone' => $this->phone,
            'whatsapp' => $this->whatsapp,
            'email' => $this->email,
            'business_hours' => $this->business_hours,

            'facebook' => $this->facebook,
            'instagram' => $this->instagram,
            'linkedin' => $this->linkedin,
            'youtube' => $this->youtube,

            'map_embed' => $this->map_embed,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,

            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'keywords' => $this->keywords,
            'og_image' => $this->og_image_path ? asset('storage/'.$this->og_image_path) : null,

            'profile_pdf' => $this->profile_pdf_path ? asset('storage/'.$this->profile_pdf_path) : null,
            'profile_pdf_size' => $this->profile_pdf_size,
            'profile_pdf_updated_at' => $this->updated_at?->toDateString(),

            'core_values' => CoreValueResource::collection($this->whenLoaded('coreValues')),
        ];
    }
}
