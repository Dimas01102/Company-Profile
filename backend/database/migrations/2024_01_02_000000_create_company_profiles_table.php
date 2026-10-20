<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_profiles', function (Blueprint $table) {
            $table->increments('id');

            // General
            $table->string('name');
            $table->string('logo_path')->nullable();
            $table->string('favicon_path')->nullable();
            $table->string('tagline')->nullable();
            $table->text('short_description')->nullable();
            $table->longText('full_description')->nullable();

            // Story
            $table->longText('history')->nullable();
            $table->string('founded_year', 4)->nullable();
            $table->text('background')->nullable();

            // Vision & mission
            $table->text('vision')->nullable();
            $table->text('mission')->nullable();

            // Business
            $table->string('business_type')->nullable();
            $table->string('industry')->nullable();
            $table->text('business_scope')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('whatsapp', 30)->nullable();
            $table->string('email')->nullable();
            $table->string('business_hours')->nullable();

            // Social
            $table->string('facebook')->nullable();
            $table->string('instagram')->nullable();
            $table->string('linkedin')->nullable();
            $table->string('youtube')->nullable();
            $table->string('other_social')->nullable();

            // Location
            $table->text('map_embed')->nullable();
            $table->string('latitude', 20)->nullable();
            $table->string('longitude', 20)->nullable();

            // SEO
            $table->string('meta_title')->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->string('keywords')->nullable();
            $table->string('og_image_path')->nullable();

            // Company profile document (PDF)
            $table->string('profile_pdf_path')->nullable();
            $table->string('profile_pdf_size')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_profiles');
    }
};
