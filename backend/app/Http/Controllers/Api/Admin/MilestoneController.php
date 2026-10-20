<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MilestoneRequest;
use App\Http\Resources\MilestoneResource;
use App\Models\Milestone;
use App\Support\ActivityLogger;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MilestoneController extends Controller
{
    /** GET /api/admin/milestones */
    public function index()
    {
        return ApiResponse::success(
            MilestoneResource::collection(Milestone::ordered()->get()),
        );
    }

    /** POST /api/admin/milestones */
    public function store(MilestoneRequest $request)
    {
        $data = $request->safe()->except(['image', 'remove_image']);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('milestones', 'public');
        }

        $data['order'] ??= (int) Milestone::max('order') + 1;

        $milestone = Milestone::create($data);

        ActivityLogger::log('Create', 'Milestones', 'Created a milestone', $milestone->title);

        return ApiResponse::created(new MilestoneResource($milestone), 'Milestone created.');
    }

    /** PUT /api/admin/milestones/{milestone} */
    public function update(MilestoneRequest $request, Milestone $milestone)
    {
        $data = $request->safe()->except(['image', 'remove_image']);

        if ($request->hasFile('image')) {
            if ($milestone->image_path) {
                Storage::disk('public')->delete($milestone->image_path);
            }
            $data['image_path'] = $request->file('image')->store('milestones', 'public');
        } elseif ($request->boolean('remove_image') && $milestone->image_path) {
            Storage::disk('public')->delete($milestone->image_path);
            $data['image_path'] = null;
        }

        $milestone->update($data);

        ActivityLogger::log('Update', 'Milestones', 'Updated a milestone', $milestone->title);

        return ApiResponse::success(new MilestoneResource($milestone), 'Milestone updated.');
    }

    /** DELETE /api/admin/milestones/{milestone} */
    public function destroy(Milestone $milestone)
    {
        if ($milestone->image_path) {
            Storage::disk('public')->delete($milestone->image_path);
        }
        $milestone->delete();

        ActivityLogger::log('Delete', 'Milestones', 'Deleted a milestone', $milestone->title);

        return ApiResponse::success(message: 'Milestone deleted.');
    }

    /** PATCH /api/admin/milestones/{milestone}/reorder */
    public function reorder(Request $request, Milestone $milestone)
    {
        $request->validate(['direction' => 'required|in:up,down']);

        $siblings = Milestone::ordered()->get();
        $index = $siblings->search(fn ($m) => $m->id === $milestone->id);
        $targetIndex = $request->input('direction') === 'up' ? $index - 1 : $index + 1;

        if ($targetIndex < 0 || $targetIndex >= $siblings->count()) {
            return ApiResponse::success(MilestoneResource::collection($siblings));
        }

        // Swap the two positions, then renumber 1..n. Swapping the stored
        // `order` values alone does nothing when two milestones share the same
        // number (the admin form lets you type any display order).
        $ids = $siblings->pluck('id')->all();
        [$ids[$index], $ids[$targetIndex]] = [$ids[$targetIndex], $ids[$index]];

        foreach ($ids as $position => $id) {
            Milestone::whereKey($id)->update(['order' => $position + 1]);
        }

        return ApiResponse::success(MilestoneResource::collection(Milestone::ordered()->get()));
    }
}
