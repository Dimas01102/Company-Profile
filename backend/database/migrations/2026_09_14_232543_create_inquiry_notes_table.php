<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inquiry_notes', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('inquiry_id');
            $table->string('author');
            $table->text('note');
            $table->timestamps();

            $table->foreign('inquiry_id')->references('id')->on('inquiries')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inquiry_notes');
    }
};