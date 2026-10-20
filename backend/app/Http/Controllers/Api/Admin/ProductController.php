<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductGalleryImage;
use App\Support\ActivityLogger;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * GET /api/admin/products
     * ?search=&category_id=&brand=&availability=&status=&sort=&direction=&per_page=
     */
    public function index(Request $request)
    {
        $query = Product::query()->with(['category', 'specs', 'galleryImages', 'relatedProducts']);

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('product_code', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->integer('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($brand = $request->string('brand')->trim()->value()) {
            $query->where('brand', $brand);
        }

        if ($status = $request->string('status')->trim()->value()) {
            $query->where('status', $status);
        }

        if ($availability = $request->string('availability')->trim()->value()) {
            match ($availability) {
                'Out of Stock' => $query->where('stock', '<=', 0),
                'Limited Stock' => $query->where('stock', '>', 0)->whereColumn('stock', '<=', 'min_stock'),
                'Available' => $query->whereColumn('stock', '>', 'min_stock'),
                default => null,
            };
        }

        $sort = in_array($request->string('sort')->value(), ['name', 'stock', 'updated_at', 'status'])
            ? $request->string('sort')->value()
            : 'updated_at';
        $direction = $request->string('direction')->value() === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $direction);

        $products = $query->paginate($request->integer('per_page', 15));

        return ApiResponse::success(
            ProductResource::collection($products),
            meta: [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ],
        );
    }

    /** POST /api/admin/products */
    public function store(ProductRequest $request)
    {
        $product = DB::transaction(function () use ($request) {
            $data = $request->safe()->except([
                'specs', 'main_image', 'gallery', 'remove_gallery_ids',
                'brochure', 'datasheet', 'og_image', 'related_ids',
            ]);

            $data = $this->attachUploads($request, $data);

            $product = Product::create($data);

            $this->syncSpecs($product, (array) $request->input('specs', []));
            $this->addGalleryImages($product, (array) $request->file('gallery', []));
            $this->syncRelated($product, (array) $request->input('related_ids', []));

            return $product;
        });

        ActivityLogger::log('Create', 'Products', 'Created a product', "{$product->sku} | {$product->name}");

        return ApiResponse::created($this->fullResource($product), 'Product created.');
    }

    /** GET /api/admin/products/{product} */
    public function show(Product $product)
    {
        return ApiResponse::success($this->fullResource($product));
    }

    /** PUT /api/admin/products/{product} */
    public function update(ProductRequest $request, Product $product)
    {
        DB::transaction(function () use ($request, $product) {
            $data = $request->safe()->except([
                'specs', 'main_image', 'gallery', 'remove_gallery_ids',
                'brochure', 'datasheet', 'og_image', 'related_ids',
            ]);

            $data = $this->attachUploads($request, $data, $product);

            $product->update($data);

            if ($request->has('specs')) {
                $this->syncSpecs($product, (array) $request->input('specs', []));
            }

            if ($request->filled('remove_gallery_ids')) {
                $images = ProductGalleryImage::whereIn('id', $request->input('remove_gallery_ids'))
                    ->where('product_id', $product->id)
                    ->get();
                foreach ($images as $image) {
                    Storage::disk('public')->delete($image->image_path);
                    $image->delete();
                }
            }
            $this->addGalleryImages($product, (array) $request->file('gallery', []));

            if ($request->has('related_ids')) {
                $this->syncRelated($product, (array) $request->input('related_ids', []));
            }
        });

        ActivityLogger::log('Update', 'Products', 'Updated a product', "{$product->sku} | {$product->name}");

        return ApiResponse::success($this->fullResource($product->fresh()), 'Product updated.');
    }

    /** DELETE /api/admin/products/{product} */
    public function destroy(Product $product)
    {
        $label = "{$product->sku} | {$product->name}";
        $suffix = '--deleted-'.$product->id;
        $product->forceFill([
            'sku' => mb_substr($product->sku, 0, 255 - mb_strlen($suffix)).$suffix,
            'slug' => mb_substr($product->slug, 0, 255 - mb_strlen($suffix)).$suffix,
        ])->saveQuietly();
        $product->delete();

        ActivityLogger::log('Delete', 'Products', 'Deleted a product', $label);

        return ApiResponse::success(message: 'Product deleted.');
    }

    /** GET /api/admin/products/{product}/related */
    public function related(Product $product)
    {
        return ApiResponse::success(ProductResource::collection($product->getRelated()));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function attachUploads(ProductRequest $request, array $data, ?Product $existing = null): array
    {
        $map = [
            'main_image' => 'main_image_path',
            'brochure' => 'brochure_path',
            'datasheet' => 'datasheet_path',
            'og_image' => 'og_image_path',
        ];
        $folder = [
            'main_image' => 'products',
            'brochure' => 'products/documents',
            'datasheet' => 'products/documents',
            'og_image' => 'products',
        ];

        foreach ($map as $field => $column) {
            if ($request->hasFile($field)) {
                if ($existing?->{$column}) {
                    Storage::disk('public')->delete($existing->{$column});
                }
                $data[$column] = $request->file($field)->store($folder[$field], 'public');
            }
        }

        return $data;
    }

    private function syncSpecs(Product $product, array $specs): void
    {
        $product->specs()->delete();
        foreach ($specs as $index => $spec) {
            if (empty($spec['label'])) {
                continue;
            }
            $product->specs()->create([
                'label' => $spec['label'],
                'value' => $spec['value'] ?? '',
                'order' => $index,
            ]);
        }
    }

    private function addGalleryImages(Product $product, array $files): void
    {
        $nextOrder = (int) $product->galleryImages()->max('order') + 1;
        foreach ($files as $file) {
            $product->galleryImages()->create([
                'image_path' => $file->store('products/gallery', 'public'),
                'order' => $nextOrder++,
            ]);
        }
    }

    private function syncRelated(Product $product, array $relatedIds): void
    {
        $relatedIds = array_values(array_diff(array_unique($relatedIds), [$product->id]));
        $product->relatedProducts()->sync($relatedIds);
    }

    private function fullResource(Product $product): ProductResource
    {
        return new ProductResource(
            $product->load(['category', 'specs', 'galleryImages', 'relatedProducts']),
        );
    }
}
