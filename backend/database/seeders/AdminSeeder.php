<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::updateOrCreate(
            ['email' => 'admin@batamkonektrajaya.co.id'],
            [
                'name' => 'Siti Rahayu',
                'phone' => '+62 812-3456-7890',
                'position' => 'Corporate Affairs Manager',
                'password' => Hash::make('Konektra#2026'),
                'email_verified_at' => now(),
            ],
        );
    }
}
