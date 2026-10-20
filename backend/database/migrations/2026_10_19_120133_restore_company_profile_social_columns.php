<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The Social Media tab stays (Facebook, Instagram, LinkedIn, YouTube). Only
 * "Other social media" was removed. If an earlier version of the cleanup
 * migration already dropped these columns on this database, add them back.
 * Safe to run on a database that still has them.
 */
return new class extends Migration
{
    private const COLUMNS = ['facebook', 'instagram', 'linkedin', 'youtube'];

    public function up(): void
    {
        if (! Schema::hasTable('company_profiles')) {
            return;
        }

        Schema::table('company_profiles', function (Blueprint $table) {
            foreach (self::COLUMNS as $column) {
                if (! Schema::hasColumn('company_profiles', $column)) {
                    $table->string($column)->nullable();
                }
            }
        });
    }

    public function down(): void
    {
        // Nothing to undo: these columns belong to the original schema.
    }
};
