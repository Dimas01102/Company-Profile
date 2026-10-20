<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompanyProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'logo_path', 'tagline', 'short_description', 'full_description',
        'history', 'founded_year', 'background',
        'vision', 'mission',
        'business_type', 'industry', 'business_scope',
        'address', 'city', 'province', 'postal_code', 'phone', 'whatsapp', 'email', 'business_hours',
        'facebook', 'instagram', 'linkedin', 'youtube',
        'map_embed', 'latitude', 'longitude',
        'meta_title', 'meta_description', 'keywords', 'og_image_path',
        'profile_pdf_path', 'profile_pdf_size',
    ];

    public function coreValues(): HasMany
    {
        return $this->hasMany(CoreValue::class)->orderBy('order');
    }

    /**
     * The whole site has exactly one company profile row. Create it with
     * sensible blank defaults on first access instead of requiring a
     * separate "setup wizard" step.
     */
    public static function current(): self
    {
        return static::query()->firstOrCreate(
            ['id' => 1],
            ['name' => config('app.name')],
        );
    }
}
