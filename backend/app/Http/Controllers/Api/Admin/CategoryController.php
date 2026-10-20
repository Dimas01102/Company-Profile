<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\ActivityLogger;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    /** GET /api/admin/categories?search=&status= */
    public function index(Request $request)
    {
        $query = Category::query()->withCount('products')->ordered();

        if ($search = $request->string('search')->trim()->value()) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($status = $request->string('status')->trim()->value()) {
            $query->where('status', $status);
        }

        return ApiResponse::success(CategoryResource::collection($query->get()));
    }

    /** POST /api/admin/categories */
    public function store(CategoryRequest $request)
    {
        $data = $request->safe()->except(['image', 'remove_image']);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('categories', 'public');
        }

        $data['order'] ??= (int) Category::max('order') + 1;
        $data['status'] ??= 'Active';

        $category = Category::create($data);

        ActivityLogger::log('Create', 'Categories', 'Created a product category', $category->name);

        return ApiResponse::created(new CategoryResource($category->loadCount('products')), 'Category created.');
    }

    /** PUT /api/admin/categories/{category} */
    public function update(CategoryRequest $request, Category $category)
    {
        $data = $request->safe()->except(['image', 'remove_image']);

        if ($request->hasFile('image')) {
            if ($category->image_path) {
                Storage::disk('public')->delete($category->image_path);
            }
            $data['image_path'] = $request->file('image')->store('categories', 'public');
        } elseif ($request->boolean('remove_image') && $category->image_path) {
            Storage::disk('public')->delete($category->image_path);
            $data['image_path'] = null;
        }

        $category->update($data);

        ActivityLogger::log('Update', 'Categories', 'Updated a product category', $category->name);

        return ApiResponse::success(new CategoryResource($category->loadCount('products')), 'Category updated.');
    }

    /** DELETE /api/admin/categories/{category} */
    public function destroy(Category $category)
    {
        if ($category->products()->exists()) {
            return ApiResponse::error(
                'This category still has products assigned to it. Move or delete those products first.',
                status: 422,
            );
        }

        if ($category->image_path) {
            Storage::disk('public')->delete($category->image_path);
        }
        $category->delete();

        ActivityLogger::log('Delete', 'Categories', 'Deleted a product category', $category->name);

        return ApiResponse::success(message: 'Category deleted.');
    }

    /** PATCH /api/admin/categories/{category}/reorder */
    public function reorder(Request $request, Category $category)
    {
        $request->validate(['direction' => 'required|in:up,down']);

        $siblings = Category::ordered()->get();
        $index = $siblings->search(fn ($c) => $c->id === $category->id);
        $targetIndex = $request->input('direction') === 'up' ? $index - 1 : $index + 1;

        if ($targetIndex < 0 || $targetIndex >= $siblings->count()) {
            return ApiResponse::success(CategoryResource::collection($siblings));
        }

        $a = $siblings[$index];
        $b = $siblings[$targetIndex];
        [$aOrder, $bOrder] = [$a->order, $b->order];
        $a->update(['order' => $bOrder]);
        $b->update(['order' => $aOrder]);

        return ApiResponse::success(CategoryResource::collection(Category::ordered()->get()));
    }
}
