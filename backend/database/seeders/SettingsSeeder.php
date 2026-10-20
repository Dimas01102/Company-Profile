<?php

namespace Database\Seeders;

use App\Models\WebsiteSetting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = WebsiteSetting::updateOrCreate(['id' => 1], [
            'hero_title' => "Powering Indonesia's Industrial Growth",
            'hero_subtitle' => 'PT Batam Konektra Jaya designs, manufactures, and integrates electrical power equipment for utilities, industrial plants, and infrastructure projects across Indonesia.',
            'hero_cta_text' => 'Explore Products',
            'hero_cta_url' => '/products',
            'show_stats' => true,
            'show_why_choose_us' => true,
            'show_featured_products' => true,
            'show_latest_news' => true,
            'show_final_cta' => true,
            'footer_description' => 'PT Batam Konektra Jaya is an industrial engineering company manufacturing transformers, switchgear, generators, and power distribution equipment in Batam, Indonesia.',
            'copyright_text' => '© '.now()->year.' PT Batam Konektra Jaya. All rights reserved.',
        ]);

        $settings->footerLinks()->delete();
        foreach ([
            ['label' => 'About Us', 'url' => '/about', 'order' => 1],
            ['label' => 'Products', 'url' => '/products', 'order' => 2],
            ['label' => 'News', 'url' => '/news', 'order' => 3],
            ['label' => 'Contact', 'url' => '/contact', 'order' => 4],
        ] as $link) {
            $settings->footerLinks()->create($link);
        }
    }
}
