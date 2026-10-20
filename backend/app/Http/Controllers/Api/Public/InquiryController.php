<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreContactRequest;
use App\Http\Requests\Public\StoreInquiryRequest;
use App\Models\Inquiry;
use App\Models\Product;
use App\Support\ApiResponse;
use App\Support\InquiryNotifier;

class InquiryController extends Controller
{
    /**
     * POST /api/inquiries
     */
    public function store(StoreInquiryRequest $request)
    {
        $productId = null;
        if ($slug = $request->validated('product_slug')) {
            $productId = Product::query()->where('slug', $slug)->value('id');
        }

        $inquiry = Inquiry::create([
            ...$request->safe()->except(['product_slug']),
            'product_id' => $productId,
        ]);

        InquiryNotifier::notify($inquiry);

        return ApiResponse::created(
            ['id' => $inquiry->id],
            "Thanks, we've received your inquiry and will be in touch shortly.",
        );
    }

    /**
     * POST /api/contact
     */
    public function contact(StoreContactRequest $request)
    {
        $inquiry = Inquiry::create([
            ...$request->validated(),
            'source' => 'Contact Page',
        ]);

        InquiryNotifier::notify($inquiry);

        return ApiResponse::created(
            ['id' => $inquiry->id],
            "Thanks for reaching out, we'll respond as soon as possible.",
        );
    }
}
