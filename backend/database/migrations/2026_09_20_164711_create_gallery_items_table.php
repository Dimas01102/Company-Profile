<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gallery_items', function (Blueprint $table) {
            $table->increments('id');
            $table->string('title');
            $table->text('caption')->nullable();
            $table->string('image_path');
            $table->string('album');
            $table->json('tags')->nullable();
            $table->date('date');
            $table->unsignedInteger('order')->default(0);
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->boolean('is_video')->default(false);
            $table->string('video_duration', 20)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['album']);
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_items');
    }
};
