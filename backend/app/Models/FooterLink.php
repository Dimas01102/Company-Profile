<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FooterLink extends Model
{
    protected $fillable = ['website_settings_id', 'label', 'url', 'order'];

    public function websiteSetting()
    {
        return $this->belongsTo(WebsiteSetting::class, 'website_settings_id');
    }
}
