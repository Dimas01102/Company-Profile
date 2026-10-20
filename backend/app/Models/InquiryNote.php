<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InquiryNote extends Model
{
    protected $fillable = ['inquiry_id', 'author', 'note'];

    public function inquiry()
    {
        return $this->belongsTo(Inquiry::class);
    }
}
