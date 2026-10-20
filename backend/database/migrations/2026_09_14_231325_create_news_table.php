<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news', function (Blueprint $table) {
            $table->increments('id');
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category');
            $table->string('author');
            $table->date('published_date');
            $table->string('read_time')->default('3 min read');
            $table->string('summary', 500)->nullable();
            $table->longText('content')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->json('tags')->nullable();
            $table->boolean('featured')->default(false);
            $table->enum('status', ['Draft', 'Published'])->default('Draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->string('meta_title')->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->string('meta_keywords')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status']);
            $table->index(['category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news');
    }
};
