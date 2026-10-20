<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GalleryItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $itemId = $this->route('galleryItem')?->id;
        $isUpdate = (bool) $itemId;

        return [
            'title' => ['required', 'string', 'max:255'],
            'caption' => ['nullable', 'string', 'max:1000'],
            'image' => [$isUpdate ? 'nullable' : 'required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('uploads.image_kb')],
            'album' => ['required', Rule::in(['Substations', 'Manufacturing', 'Projects', 'Videos'])],
            'tags' => ['nullable', 'string', 'max:500'],
            'date' => ['required', 'date'],
            'order' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', Rule::in(['Active', 'Inactive'])],
            'is_video' => ['nullable', 'boolean'],
            'video_duration' => ['nullable', 'string', 'max:20'],
        ];
    }
}
