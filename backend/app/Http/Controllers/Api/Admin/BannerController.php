<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BannerRequest;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use App\Support\ActivityLogger;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    /** GET /api/admin/banners?search=&status= */
    public function index(Request $request)
    {
        $query = Banner::query()->ordered();

        if ($search = $request->string('search')->trim()->value()) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($status = $request->string('status')->trim()->value()) {
            $query->where('status', $status);
        }

        return ApiResponse::success(BannerResource::collection($query->get()));
    }

    /** POST /api/admin/banners */
    public function store(BannerRequest $request)
    {
        $data = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('banners', 'public');
        }

        $data['order'] ??= (int) Banner::max('order') + 1;
        $data['status'] ??= 'Active';

        $banner = Banner::create($data);

        ActivityLogger::log('Create', 'Banners', 'Created a homepage banner', $banner->title);

        return ApiResponse::created(new BannerResource($banner), 'Banner created.');
    }

    /** PUT /api/admin/banners/{banner} */
    public function update(BannerRequest $request, Banner $banner)
    {
        $data = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($banner->image_path);
            $data['image_path'] = $request->file('image')->store('banners', 'public');
        }

        $banner->update($data);

        ActivityLogger::log('Update', 'Banners', 'Updated a homepage banner', $banner->title);

        return ApiResponse::success(new BannerResource($banner), 'Banner updated.');
    }

    /** DELETE /api/admin/banners/{banner} */
    public function destroy(Banner $banner)
    {
        Storage::disk('public')->delete($banner->image_path);
        $banner->delete();

        ActivityLogger::log('Delete', 'Banners', 'Deleted a homepage banner', $banner->title);

        return ApiResponse::success(message: 'Banner deleted.');
    }

    /** PATCH /api/admin/banners/{banner}/reorder */
    public function reorder(Request $request, Banner $banner)
    {
        $request->validate(['direction' => 'required|in:up,down']);

        $siblings = Banner::ordered()->get();
        $index = $siblings->search(fn ($b) => $b->id === $banner->id);
        $targetIndex = $request->input('direction') === 'up' ? $index - 1 : $index + 1;

        if ($targetIndex < 0 || $targetIndex >= $siblings->count()) {
            return ApiResponse::success(BannerResource::collection($siblings));
        }

        $a = $siblings[$index];
        $b = $siblings[$targetIndex];
        [$aOrder, $bOrder] = [$a->order, $b->order];
        $a->update(['order' => $bOrder]);
        $b->update(['order' => $aOrder]);

        return ApiResponse::success(BannerResource::collection(Banner::ordered()->get()));
    }
}
