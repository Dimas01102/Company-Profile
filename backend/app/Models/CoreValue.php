<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CoreValue extends Model
{
    use HasFactory;

    protected $fillable = ['company_profile_id', 'name', 'description', 'icon', 'order'];

    public function companyProfile()
    {
        return $this->belongsTo(CompanyProfile::class);
    }
}
