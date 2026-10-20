<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->increments('id');

            // Basic
            $table->string('name');
            $table->string('sku')->unique();
            $table->string('product_code')->nullable();
            $table->string('slug')->unique();
            $table->unsignedInteger('category_id');
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('short_description', 500)->nullable();

            // Inventory / availability, Availability itself is a computed
            // value (see Product::getAvailabilityAttribute), never stored,
            // so it can't drift out of sync with stock/min_stock.
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(0);
            $table->string('warehouse')->nullable();
            $table->enum('status', ['Draft', 'Published', 'Archived'])->default('Draft');

            // Description
            $table->longText('description')->nullable();
            $table->text('features')->nullable();
            $table->text('applications')->nullable();
            $table->text('advantages')->nullable();
            $table->text('industries')->nullable();
            $table->text('standards')->nullable();

            // Media
            $table->string('main_image_path')->nullable();
            $table->string('brochure_path')->nullable();
            $table->string('datasheet_path')->nullable();

            // SEO
            $table->string('meta_title')->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->string('keywords')->nullable();
            $table->string('og_image_path')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('category_id')->references('id')->on('categories')->restrictOnDelete();
            $table->index(['status']);
            $table->index(['brand']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
