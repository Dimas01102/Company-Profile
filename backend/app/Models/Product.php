<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'sku', 'product_code', 'slug', 'category_id', 'brand', 'model', 'short_description',
        'stock', 'min_stock', 'warehouse', 'status',
        'description', 'features', 'applications', 'advantages', 'industries', 'standards',
        'main_image_path', 'brochure_path', 'datasheet_path',
        'meta_title', 'meta_description', 'keywords', 'og_image_path',
    ];

    protected function casts(): array
    {
        return [
            'stock' => 'integer',
            'min_stock' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function specs(): HasMany
    {
        return $this->hasMany(ProductSpec::class)->orderBy('order');
    }

    public function galleryImages(): HasMany
    {
        return $this->hasMany(ProductGalleryImage::class)->orderBy('order');
    }

    /** Manually curated related products (admin picks these explicitly). */
    public function relatedProducts(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'product_related',
            'product_id',
            'related_product_id',
        );
    }

    /**
     * Business rule (project requirement):
     *   stock = 0          -> Out of Stock
     *   stock <= min_stock -> Limited Stock
     *   stock > min_stock  -> Available
     * Never stored, always derived from current stock so it can't drift.
     */
    public function getAvailabilityAttribute(): string
    {
        if ($this->stock <= 0) {
            return 'Out of Stock';
        }

        if ($this->stock <= $this->min_stock) {
            return 'Limited Stock';
        }

        return 'Available';
    }

    public function scopePublished(Builder $query)
    {
        return $query->where('status', 'Published');
    }

    /**
     * Related products: the admin's manual picks if any exist, otherwise
     * up to 3 products sharing the same category or brand.
     */
    public function getRelated(int $limit = 3)
    {
        $manual = $this->relatedProducts()->with('category')->get();

        if ($manual->isNotEmpty()) {
            return $manual;
        }

        return static::query()
            ->published()
            ->where('id', '!=', $this->id)
            ->where(function ($q) {
                $q->where('category_id', $this->category_id)
                    ->orWhere('brand', $this->brand);
            })
            ->with('category')
            ->limit($limit)
            ->get();
    }
}
