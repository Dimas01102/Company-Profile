<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\WebsiteSetting
 */
class WebsiteSettingsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'hero_title' => $this->hero_title,
            'hero_subtitle' => $this->hero_subtitle,
            'hero_cta_text' => $this->hero_cta_text,
            'hero_cta_url' => $this->hero_cta_url,

            'show_stats' => $this->show_stats,
            'show_why_choose_us' => $this->show_why_choose_us,
            'show_featured_products' => $this->show_featured_products,
            'show_latest_news' => $this->show_latest_news,
            'show_final_cta' => $this->show_final_cta,

            'footer_description' => $this->footer_description,
            'copyright_text' => $this->copyright_text,
            'footer_links' => $this->whenLoaded('footerLinks', fn () => $this->footerLinks->map(fn ($l) => [
                'id' => $l->id,
                'label' => $l->label,
                'url' => $l->url,
                'order' => $l->order,
            ])),
        ];
    }
}
