<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductGalleryImage extends Model
{
    protected $fillable = ['product_id', 'image_path', 'order'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
