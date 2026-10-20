<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('core_values', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('company_profile_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon')->default('ShieldCheck');
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->foreign('company_profile_id')
                ->references('id')->on('company_profiles')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('core_values');
    }
};
