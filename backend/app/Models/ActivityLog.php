<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    // Append-only log, no updated_at column, entries are never edited.
    const UPDATED_AT = null;

    protected $fillable = [
        'admin_id', 'admin_name', 'action', 'module', 'description', 'affected_data', 'status',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }
}
