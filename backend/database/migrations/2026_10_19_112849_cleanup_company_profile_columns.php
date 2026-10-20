<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

/**
 * Removes the Favicon and "Other social media" fields from the company profile
 * (they are no longer part of the admin console or the public website) and
 * widens business_hours so it can hold one line per opening-hours row.
 * Facebook, Instagram, LinkedIn and YouTube stay.
 */
return new class extends Migration
{
    private const DROPPED = [
        'favicon_path',
        'other_social',
    ];

    public function up(): void
    {
        if (! Schema::hasTable('company_profiles')) {
            return;
        }

        // Delete any favicon file that was already uploaded.
        if (Schema::hasColumn('company_profiles', 'favicon_path')) {
            DB::table('company_profiles')
                ->whereNotNull('favicon_path')
                ->pluck('favicon_path')
                ->each(fn ($path) => Storage::disk('public')->delete($path));
        }

        $existing = array_values(array_filter(
            self::DROPPED,
            fn ($column) => Schema::hasColumn('company_profiles', $column),
        ));

        Schema::table('company_profiles', function (Blueprint $table) use ($existing) {
            if ($existing) {
                $table->dropColumn($existing);
            }
            $table->text('business_hours')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->string('business_hours')->nullable()->change();
            $table->string('favicon_path')->nullable();
            $table->string('other_social')->nullable();
        });
    }
};
