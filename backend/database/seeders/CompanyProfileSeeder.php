<?php

namespace Database\Seeders;

use App\Models\CompanyProfile;
use Illuminate\Database\Seeder;

class CompanyProfileSeeder extends Seeder
{
    public function run(): void
    {
        $profile = CompanyProfile::updateOrCreate(['id' => 1], [
            'name' => 'PT Batam Konektra Jaya',
            'tagline' => 'Powering Indonesia\'s Industrial Growth',
            'short_description' => 'Industrial engineering company manufacturing transformers, switchgear, generators, and power distribution equipment in Batam, Indonesia.',
            'full_description' => 'PT Batam Konektra Jaya designs, manufactures, and integrates electrical power equipment for utilities, industrial plants, and infrastructure projects across Indonesia. Our Batam facility produces distribution transformers, low- and medium-voltage switchgear, busbar trunking, and control panels, all type-tested to IEC, SPLN, and SNI standards. Alongside equipment supply we deliver turnkey substation packages including engineering design, installation supervision, commissioning, and long-term maintenance.',

            'history' => 'Founded in 2004 as a panel assembly workshop in Batam, the company grew into a full electrical equipment manufacturer serving PLN contractors, industrial estates, and offshore operators. Investment in a dedicated transformer line in 2013 and an in-house testing laboratory in 2018 established Konektra as a trusted local alternative to imported equipment.',
            'founded_year' => '2004',
            'background' => 'Konektra was established to reduce Indonesia\'s dependency on imported power equipment by combining local manufacturing capability with international engineering standards.',

            'vision' => 'To be Indonesia\'s most trusted partner for industrial power equipment and substation engineering.',
            'mission' => 'Deliver reliable, standard-compliant electrical equipment; support every project with responsive engineering and after-sales service; develop local engineering talent; and operate safely and sustainably at every site.',

            'business_type' => 'Limited Liability Company (Perseroan Terbatas)',
            'industry' => 'Electrical Equipment Manufacturing & Power Engineering',
            'business_scope' => 'Transformer manufacturing, switchgear assembly, generator packaging, substation EPC, testing and commissioning, preventive maintenance.',
            'address' => 'Kawasan Industri Batamindo, Lot 312',
            'city' => 'Batam',
            'province' => 'Kepulauan Riau',
            'postal_code' => '29433',
            'phone' => '+62 778 123 4567',
            'whatsapp' => '+62 812 3456 7890',
            'email' => 'info@batamkonektrajaya.co.id',
            'business_hours' => "Monday - Friday: 08:00 - 17:00 WIB\nSaturday: 09:00 - 13:00 WIB\nSunday & Public Holidays: Closed",

            'facebook' => 'https://facebook.com/batamkonektrajaya',
            'instagram' => 'https://instagram.com/batamkonektrajaya',
            'linkedin' => 'https://linkedin.com/company/batam-konektra-jaya',
            'youtube' => 'https://youtube.com/@batamkonektrajaya',

            'map_embed' => 'https://www.google.com/maps?q=Kawasan+Industri+Batamindo+Batam+Indonesia&output=embed',
            'latitude' => '1.0451',
            'longitude' => '104.0305',

            'meta_title' => 'PT Batam Konektra Jaya | Industrial Power Solutions',
            'meta_description' => 'Transformers, switchgear, generator sets, and turnkey substation engineering for utilities and industry across Indonesia.',
            'keywords' => 'transformer batam, switchgear indonesia, genset industri, substation epc, panel listrik batam',
        ]);

        $profile->coreValues()->delete();
    }
}
