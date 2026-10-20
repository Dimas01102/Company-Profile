<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Only what the application cannot run without:
     *  - the admin account used to sign in,
     *  - the single company-profile row,
     *  - the default website settings (homepage hero text, section toggles, footer).
     *
     * All demo content (products, categories, news, gallery, banners,
     * employees, milestones, inquiries, activity logs) is intentionally NOT
     * seeded, add it from the admin console.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            CompanyProfileSeeder::class,
            SettingsSeeder::class,
        ]);
    }
}
