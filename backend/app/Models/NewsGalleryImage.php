<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsGalleryImage extends Model
{
    protected $fillable = ['news_id', 'image_path', 'order'];

    public function news()
    {
        return $this->belongsTo(News::class);
    }
}
