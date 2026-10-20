<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('website_settings', function (Blueprint $table) {
            $table->increments('id');

            $table->string('hero_title')->nullable();
            $table->text('hero_subtitle')->nullable();
            $table->string('hero_cta_text')->nullable();
            $table->string('hero_cta_url')->nullable();

            $table->boolean('show_stats')->default(true);
            $table->boolean('show_why_choose_us')->default(true);
            $table->boolean('show_featured_products')->default(true);
            $table->boolean('show_latest_news')->default(true);
            $table->boolean('show_final_cta')->default(true);

            $table->text('footer_description')->nullable();
            $table->string('copyright_text')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('website_settings');
    }
};
