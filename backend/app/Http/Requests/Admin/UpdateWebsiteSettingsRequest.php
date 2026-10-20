<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWebsiteSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hero_title' => ['nullable', 'string', 'max:255'],
            'hero_subtitle' => ['nullable', 'string', 'max:1000'],
            'hero_cta_text' => ['nullable', 'string', 'max:100'],
            'hero_cta_url' => ['nullable', 'string', 'max:255'],

            'show_stats' => ['nullable', 'boolean'],
            'show_why_choose_us' => ['nullable', 'boolean'],
            'show_featured_products' => ['nullable', 'boolean'],
            'show_latest_news' => ['nullable', 'boolean'],
            'show_final_cta' => ['nullable', 'boolean'],

            'footer_description' => ['nullable', 'string', 'max:1000'],
            'copyright_text' => ['required', 'string', 'max:255'],

            'footer_links' => ['nullable', 'array'],
            'footer_links.*.label' => ['required_with:footer_links', 'string', 'max:100'],
            'footer_links.*.url' => ['required_with:footer_links', 'string', 'max:255'],
            'footer_links.*.order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
