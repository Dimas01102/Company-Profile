<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news_gallery_images', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('news_id');
            $table->string('image_path');
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->foreign('news_id')->references('id')->on('news')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news_gallery_images');
    }
};
