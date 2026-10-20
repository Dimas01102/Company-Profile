<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicProductResource;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * GET /api/products
     * ?search=&category=&brand=&availability=&per_page=
     */
    public function index(Request $request)
    {
        $query = Product::query()->published()->with('category');

        if ($search = $request->string('search')->trim()->value()) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($category = $request->string('category')->trim()->value()) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        if ($brand = $request->string('brand')->trim()->value()) {
            $query->where('brand', $brand);
        }

        if ($availability = $request->string('availability')->trim()->value()) {
            match ($availability) {
                'Out of Stock' => $query->where('stock', '<=', 0),
                'Limited Stock' => $query->where('stock', '>', 0)->whereColumn('stock', '<=', 'min_stock'),
                'Available' => $query->whereColumn('stock', '>', 'min_stock'),
                default => null,
            };
        }

        $products = $query->orderBy('name')->paginate($request->integer('per_page', 12));

        return ApiResponse::success(
            PublicProductResource::collection($products),
            meta: [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ],
        );
    }

    /**
     * GET /api/products/{slug}
     * 404s for Draft/Archived products exactly the same as for a slug that
     * doesn't exist at all, a visitor should never learn draft content
     * exists from the response shape.
     */
    public function show(string $slug)
    {
        $product = Product::query()
            ->published()
            ->where('slug', $slug)
            ->with(['category', 'specs', 'galleryImages'])
            ->firstOrFail();

        $data = (new PublicProductResource($product))->toArray(request());
        $data['related'] = PublicProductResource::collection($product->getRelated());

        return ApiResponse::success($data);
    }
}
