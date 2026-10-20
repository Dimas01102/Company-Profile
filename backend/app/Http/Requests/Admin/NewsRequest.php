<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NewsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $newsId = $this->route('news')?->id;
        $imageRule = ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('uploads.image_kb')];

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'alpha_dash', Rule::unique('news', 'slug')->ignore($newsId)],
            'category' => ['required', Rule::in(['Project', 'Company', 'Technology', 'Industry', 'Events'])],
            'author' => ['required', 'string', 'max:255'],
            'published_date' => ['required', 'date'],
            'read_time' => ['nullable', 'string', 'max:50'],
            'summary' => ['required', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'thumbnail' => $imageRule,
            'remove_thumbnail' => ['nullable', 'boolean'],
            'tags' => ['nullable', 'string', 'max:500'],
            'featured' => ['nullable', 'boolean'],
            'status' => ['required', Rule::in(['Draft', 'Published'])],
            'scheduled_at' => ['nullable', 'date'],

            'gallery' => ['nullable', 'array'],
            'gallery.*' => $imageRule,
            'remove_gallery_ids' => ['nullable', 'array'],
            'remove_gallery_ids.*' => ['integer', Rule::exists('news_gallery_images', 'id')],

            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_keywords' => ['nullable', 'string', 'max:255'],
        ];
    }
}
