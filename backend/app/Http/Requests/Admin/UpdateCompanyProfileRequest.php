<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $imageRule = ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,svg,ico', 'max:'.config('uploads.image_kb')];

        return [
            // General
            'name' => ['required', 'string', 'max:255'],
            'logo' => $imageRule,
            'tagline' => ['nullable', 'string', 'max:255'],
            'short_description' => ['nullable', 'string', 'max:1000'],
            'full_description' => ['nullable', 'string'],

            // Story
            'history' => ['nullable', 'string'],
            'founded_year' => ['nullable', 'digits:4'],
            'background' => ['nullable', 'string'],

            // Vision & mission
            'vision' => ['nullable', 'string'],
            'mission' => ['nullable', 'string'],

            // Business
            'business_type' => ['nullable', 'string', 'max:255'],
            'industry' => ['nullable', 'string', 'max:255'],
            'business_scope' => ['nullable', 'string'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'phone' => ['nullable', 'string', 'max:30'],
            'whatsapp' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'business_hours' => ['nullable', 'string', 'max:1000'],

            // Social
            'facebook' => ['nullable', 'url', 'max:255'],
            'instagram' => ['nullable', 'url', 'max:255'],
            'linkedin' => ['nullable', 'url', 'max:255'],
            'youtube' => ['nullable', 'url', 'max:255'],

            // Location
            'map_embed' => ['nullable', 'string'],
            'latitude' => ['nullable', 'string', 'max:20'],
            'longitude' => ['nullable', 'string', 'max:20'],

            // SEO
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'keywords' => ['nullable', 'string', 'max:255'],
            'og_image' => $imageRule,

            // Document
            'profile_pdf' => ['nullable', 'file', 'mimes:pdf', 'max:'.config('uploads.document_kb')],

            // "Remove" buttons in the admin form delete the stored file
            // when no replacement is uploaded in the same request.
            'remove_logo' => ['nullable', 'boolean'],
            'remove_og_image' => ['nullable', 'boolean'],
            'remove_profile_pdf' => ['nullable', 'boolean'],

            'core_values' => ['nullable', 'array'],
            'core_values.*.name' => ['required_with:core_values', 'string', 'max:255'],
            'core_values.*.description' => ['nullable', 'string', 'max:500'],
            'core_values.*.icon' => ['nullable', 'string', 'max:100'],
            'core_values.*.order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
