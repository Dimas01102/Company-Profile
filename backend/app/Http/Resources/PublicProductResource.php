<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

/**
 * What the public website may know about a product. Inventory fields
 * (stock, minimum stock, warehouse, internal product code) stay admin-only.
 *
 * @mixin \App\Models\Product
 */
class PublicProductResource extends ProductResource
{
    public function toArray(Request $request): array
    {
        return collect(parent::toArray($request))
            ->except(['stock', 'min_stock', 'warehouse', 'product_code', 'status', 'related_ids'])
            ->all();
    }
}
