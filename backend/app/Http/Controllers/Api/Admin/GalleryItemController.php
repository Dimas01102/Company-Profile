<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GalleryItemRequest;
use App\Http\Resources\GalleryItemResource;
use App\Models\GalleryItem;
use App\Support\ActivityLogger;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleryItemController extends Controller
{
    /** GET /api/admin/gallery?search=&album=&status= */
    public function index(Request $request)
    {
        $query = GalleryItem::query()->ordered();

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")->orWhere('caption', 'like', "%{$search}%");
            });
        }

        if ($album = $request->string('album')->trim()->value()) {
            $query->where('album', $album);
        }

        if ($status = $request->string('status')->trim()->value()) {
            $query->where('status', $status);
        }

        return ApiResponse::success(GalleryItemResource::collection($query->get()));
    }

    /** POST /api/admin/gallery */
    public function store(GalleryItemRequest $request)
    {
        $data = $this->prepare($request);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('gallery', 'public');
        }

        $data['order'] ??= (int) GalleryItem::max('order') + 1;
        $data['status'] ??= 'Active';

        $item = GalleryItem::create($data);

        ActivityLogger::log('Create', 'Gallery', 'Added a gallery image', $item->title);

        return ApiResponse::created(new GalleryItemResource($item), 'Gallery item added.');
    }

    /** PUT /api/admin/gallery/{gallery_item} */
    public function update(GalleryItemRequest $request, GalleryItem $galleryItem)
    {
        $data = $this->prepare($request);

        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($galleryItem->image_path);
            $data['image_path'] = $request->file('image')->store('gallery', 'public');
        }

        $galleryItem->update($data);

        ActivityLogger::log('Update', 'Gallery', 'Updated a gallery image', $galleryItem->title);

        return ApiResponse::success(new GalleryItemResource($galleryItem), 'Gallery item updated.');
    }

    /** DELETE /api/admin/gallery/{gallery_item} */
    public function destroy(GalleryItem $galleryItem)
    {
        Storage::disk('public')->delete($galleryItem->image_path);
        $galleryItem->delete();

        ActivityLogger::log('Delete', 'Gallery', 'Deleted a gallery image', $galleryItem->title);

        return ApiResponse::success(message: 'Gallery item deleted.');
    }

    /** PATCH /api/admin/gallery/{gallery_item}/reorder */
    public function reorder(Request $request, GalleryItem $galleryItem)
    {
        $request->validate(['direction' => 'required|in:up,down']);

        $siblings = GalleryItem::ordered()->get();
        $index = $siblings->search(fn ($g) => $g->id === $galleryItem->id);
        $targetIndex = $request->input('direction') === 'up' ? $index - 1 : $index + 1;

        if ($targetIndex < 0 || $targetIndex >= $siblings->count()) {
            return ApiResponse::success(GalleryItemResource::collection($siblings));
        }

        $a = $siblings[$index];
        $b = $siblings[$targetIndex];
        [$aOrder, $bOrder] = [$a->order, $b->order];
        $a->update(['order' => $bOrder]);
        $b->update(['order' => $aOrder]);

        return ApiResponse::success(GalleryItemResource::collection(GalleryItem::ordered()->get()));
    }

    private function prepare(GalleryItemRequest $request): array
    {
        $data = $request->safe()->except(['image', 'tags']);
        $data['tags'] = collect(explode(',', (string) $request->input('tags')))
            ->map(fn ($t) => trim($t))
            ->filter()
            ->values()
            ->all();

        return $data;
    }
}
