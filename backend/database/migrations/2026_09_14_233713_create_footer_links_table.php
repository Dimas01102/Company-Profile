<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('footer_links', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('website_settings_id');
            $table->string('label');
            $table->string('url');
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->foreign('website_settings_id')
                ->references('id')->on('website_settings')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('footer_links');
    }
};
