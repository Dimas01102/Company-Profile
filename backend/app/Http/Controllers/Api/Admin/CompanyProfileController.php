<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateCompanyProfileRequest;
use App\Http\Resources\CompanyProfileResource;
use App\Models\CompanyProfile;
use App\Support\ActivityLogger;
use App\Support\ApiResponse;
use App\Support\MapLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class CompanyProfileController extends Controller
{
    /** GET /api/admin/company-profile */
    public function show()
    {
        $profile = CompanyProfile::current()->load('coreValues');

        return ApiResponse::success(new CompanyProfileResource($profile));
    }

    /** PUT /api/admin/company-profile */
    public function update(UpdateCompanyProfileRequest $request)
    {
        $profile = CompanyProfile::current();
        $data = $request->safe()->except([
            'logo', 'og_image', 'profile_pdf', 'core_values',
            'remove_logo', 'remove_og_image', 'remove_profile_pdf',
        ]);

        foreach (['logo' => 'logo_path', 'og_image' => 'og_image_path'] as $field => $column) {
            if ($request->hasFile($field)) {
                if ($profile->{$column}) {
                    Storage::disk('public')->delete($profile->{$column});
                }
                $data[$column] = $request->file($field)->store('company', 'public');
            } elseif ($request->boolean("remove_{$field}") && $profile->{$column}) {
                Storage::disk('public')->delete($profile->{$column});
                $data[$column] = null;
            }
        }

        if ($request->hasFile('profile_pdf')) {
            if ($profile->profile_pdf_path) {
                Storage::disk('public')->delete($profile->profile_pdf_path);
            }
            $file = $request->file('profile_pdf');
            $data['profile_pdf_path'] = $file->store('company/documents', 'public');
            $data['profile_pdf_size'] = round($file->getSize() / 1024 / 1024, 1).' MB';
        } elseif ($request->boolean('remove_profile_pdf') && $profile->profile_pdf_path) {
            Storage::disk('public')->delete($profile->profile_pdf_path);
            $data['profile_pdf_path'] = null;
            $data['profile_pdf_size'] = null;
        }

        DB::transaction(function () use ($profile, $data, $request) {
            $profile->update($data);

            if ($request->has('core_values')) {
                $profile->coreValues()->delete();
                foreach ((array) $request->input('core_values', []) as $index => $value) {
                    $profile->coreValues()->create([
                        'name' => $value['name'],
                        'description' => $value['description'] ?? null,
                        'icon' => $value['icon'] ?? 'ShieldCheck',
                        'order' => $value['order'] ?? $index,
                    ]);
                }
            }
        });

        ActivityLogger::log('Update', 'Company Profile', 'Updated company profile', $profile->name);

        return ApiResponse::success(
            new CompanyProfileResource($profile->fresh('coreValues')),
            'Company profile updated.',
        );
    }

    /**
     * POST /api/admin/company-profile/resolve-map
     *
     * Turns a pasted Google Maps link (including short maps.app.goo.gl links,
     * which a browser cannot expand because of CORS) into latitude/longitude
     * and an embeddable URL. Only Google hosts are contacted.
     */
    public function resolveMap(Request $request)
    {
        $data = $request->validate(['url' => ['required', 'string', 'max:2000']]);
        $url = trim($data['url']);

        $found = MapLink::extract($url);
        $body = '';

        for ($hop = 0; ! $found && $hop < 6; $hop++) {
            $host = parse_url($url, PHP_URL_HOST);
            $scheme = parse_url($url, PHP_URL_SCHEME);

            if (! in_array($scheme, ['http', 'https'], true) || ! MapLink::isAllowedHost($host)) {
                return ApiResponse::error('Only Google Maps links can be read. Paste a link from Google Maps.', 422);
            }

            try {
                $response = Http::withOptions(['allow_redirects' => false])
                    ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; KonektraMapResolver/1.0)'])
                    ->timeout(8)
                    ->get($url);
            } catch (\Throwable $e) {
                return ApiResponse::error('Google Maps could not be reached from the server. Type the latitude and longitude manually.', 422);
            }

            if ($response->redirect() && $location = $response->header('Location')) {
                $url = str_starts_with($location, 'http')
                    ? $location
                    : ($scheme.'://'.$host.'/'.ltrim($location, '/'));
                $found = MapLink::extract($url);

                continue;
            }

            $body = (string) $response->body();
            $found = MapLink::extract($body);
            break;
        }

        if (! $found) {
            return ApiResponse::error(
                'No coordinates were found in that link. Open the place in Google Maps, copy the full link from the address bar, or type the latitude and longitude manually.',
                422,
            );
        }

        return ApiResponse::success([
            'latitude' => $found['latitude'],
            'longitude' => $found['longitude'],
            'embed_url' => MapLink::embedUrl($found['latitude'], $found['longitude']),
        ]);
    }
}
