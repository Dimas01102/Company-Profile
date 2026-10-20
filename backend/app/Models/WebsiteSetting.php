<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WebsiteSetting extends Model
{
    protected $table = 'website_settings';

    protected $fillable = [
        'hero_title', 'hero_subtitle', 'hero_cta_text', 'hero_cta_url',
        'show_stats', 'show_why_choose_us', 'show_featured_products', 'show_latest_news', 'show_final_cta',
        'footer_description', 'copyright_text',
    ];

    protected function casts(): array
    {
        return [
            'show_stats' => 'boolean',
            'show_why_choose_us' => 'boolean',
            'show_featured_products' => 'boolean',
            'show_latest_news' => 'boolean',
            'show_final_cta' => 'boolean',
        ];
    }

    public function footerLinks(): HasMany
    {
        return $this->hasMany(FooterLink::class, 'website_settings_id')->orderBy('order');
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate(
            ['id' => 1],
            [
                'hero_title' => "Powering Indonesia's Industrial Growth",
                'copyright_text' => '© '.now()->year.' PT Batam Konektra Jaya. All rights reserved.',
            ],
        );
    }
}
