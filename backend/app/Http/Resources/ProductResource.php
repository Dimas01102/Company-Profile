<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Product
 */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'sku' => $this->sku,
            'product_code' => $this->product_code,
            'slug' => $this->slug,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => $this->category->name),
            'brand' => $this->brand,
            'model' => $this->model,
            'short_description' => $this->short_description,

            'stock' => $this->stock,
            'min_stock' => $this->min_stock,
            'warehouse' => $this->warehouse,
            'status' => $this->status,
            // Computed, never stored, see Product::getAvailabilityAttribute().
            'availability' => $this->availability,

            'specs' => $this->whenLoaded('specs', fn () => $this->specs->map(fn ($s) => [
                'id' => $s->id,
                'label' => $s->label,
                'value' => $s->value,
            ])),

            'description' => $this->description,
            'features' => $this->features,
            'applications' => $this->applications,
            'advantages' => $this->advantages,
            'industries' => $this->industries,
            'standards' => $this->standards,

            'main_image' => $this->main_image_path ? asset('storage/'.$this->main_image_path) : null,
            'gallery' => $this->whenLoaded('galleryImages', fn () => $this->galleryImages->map(fn ($g) => [
                'id' => $g->id,
                'url' => asset('storage/'.$g->image_path),
            ])),
            'brochure' => $this->brochure_path ? asset('storage/'.$this->brochure_path) : null,
            'datasheet' => $this->datasheet_path ? asset('storage/'.$this->datasheet_path) : null,

            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'keywords' => $this->keywords,
            'og_image' => $this->og_image_path ? asset('storage/'.$this->og_image_path) : null,

            'related_ids' => $this->whenLoaded('relatedProducts', fn () => $this->relatedProducts->pluck('id')),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
