<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id;
        $imageRule = ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('uploads.image_kb')];

        return [
            // Basic
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($productId)],
            'product_code' => ['nullable', 'string', 'max:100'],
            'slug' => ['required', 'alpha_dash', Rule::unique('products', 'slug')->ignore($productId)],
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')],
            'brand' => ['nullable', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:100'],
            'short_description' => ['nullable', 'string', 'max:500'],

            // Inventory
            'stock' => ['required', 'integer', 'min:0'],
            'min_stock' => ['required', 'integer', 'min:0'],
            'warehouse' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['Draft', 'Published', 'Archived'])],

            // Technical specifications, flexible label/value rows.
            'specs' => ['nullable', 'array'],
            'specs.*.label' => ['required_with:specs', 'string', 'max:100'],
            'specs.*.value' => ['nullable', 'string', 'max:255'],

            // Description
            'description' => ['nullable', 'string'],
            'features' => ['nullable', 'string'],
            'applications' => ['nullable', 'string'],
            'advantages' => ['nullable', 'string'],
            'industries' => ['nullable', 'string'],
            'standards' => ['nullable', 'string'],

            // Media
            'main_image' => $imageRule,
            'gallery' => ['nullable', 'array'],
            'gallery.*' => $imageRule,
            'remove_gallery_ids' => ['nullable', 'array'],
            'remove_gallery_ids.*' => ['integer', Rule::exists('product_gallery_images', 'id')],
            'brochure' => ['nullable', 'file', 'mimes:pdf', 'max:'.config('uploads.document_kb')],
            'datasheet' => ['nullable', 'file', 'mimes:pdf', 'max:'.config('uploads.document_kb')],

            // SEO
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'keywords' => ['nullable', 'string', 'max:255'],
            'og_image' => $imageRule,

            'related_ids' => ['nullable', 'array'],
            'related_ids.*' => ['integer', Rule::exists('products', 'id')],
        ];
    }
}
