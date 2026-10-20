<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateWebsiteSettingsRequest;
use App\Http\Resources\WebsiteSettingsResource;
use App\Models\WebsiteSetting;
use App\Support\ActivityLogger;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\DB;

class SettingsController extends Controller
{
    /** GET /api/admin/settings */
    public function show()
    {
        $settings = WebsiteSetting::current()->load('footerLinks');

        return ApiResponse::success(new WebsiteSettingsResource($settings));
    }

    /** PUT /api/admin/settings */
    public function update(UpdateWebsiteSettingsRequest $request)
    {
        $settings = WebsiteSetting::current();
        $data = $request->safe()->except('footer_links');

        DB::transaction(function () use ($settings, $data, $request) {
            $settings->update($data);

            if ($request->has('footer_links')) {
                $settings->footerLinks()->delete();
                foreach ((array) $request->input('footer_links', []) as $index => $link) {
                    $settings->footerLinks()->create([
                        'label' => $link['label'],
                        'url' => $link['url'],
                        'order' => $link['order'] ?? $index,
                    ]);
                }
            }
        });

        ActivityLogger::log('Update', 'Settings', 'Updated homepage and footer settings', 'Website Settings');

        return ApiResponse::success(
            new WebsiteSettingsResource($settings->fresh('footerLinks')),
            'Settings saved.',
        );
    }
}
