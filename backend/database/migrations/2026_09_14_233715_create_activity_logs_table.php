<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('admin_id')->nullable();
            $table->string('admin_name');
            $table->string('action');
            $table->string('module');
            $table->string('description');
            $table->string('affected_data')->nullable();
            $table->enum('status', ['Success', 'Failed'])->default('Success');
            $table->timestamp('created_at')->nullable();

            $table->foreign('admin_id')->references('id')->on('admins')->nullOnDelete();
            $table->index(['module']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
