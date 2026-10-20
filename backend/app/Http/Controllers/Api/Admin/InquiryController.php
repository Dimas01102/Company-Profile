<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AddInquiryNoteRequest;
use App\Http\Requests\Admin\UpdateInquiryStatusRequest;
use App\Http\Resources\InquiryResource;
use App\Models\Inquiry;
use App\Support\ActivityLogger;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    /** GET /api/admin/inquiries?search=&status=&per_page= */
    public function index(Request $request)
    {
        $query = Inquiry::query()->with('product')->status($request->string('status')->trim()->value() ?: null);

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $inquiries = $query->latest()->paginate($request->integer('per_page', 8));

        return ApiResponse::success(
            InquiryResource::collection($inquiries),
            meta: [
                'current_page' => $inquiries->currentPage(),
                'last_page' => $inquiries->lastPage(),
                'total' => $inquiries->total(),
                'new_count' => Inquiry::query()->status('New')->count(),
            ],
        );
    }

    /** GET /api/admin/inquiries/{inquiry} */
    public function show(Inquiry $inquiry)
    {
        return ApiResponse::success(new InquiryResource($inquiry->load(['product', 'notes'])));
    }

    /** PATCH /api/admin/inquiries/{inquiry}/status */
    public function updateStatus(UpdateInquiryStatusRequest $request, Inquiry $inquiry)
    {
        $inquiry->update(['status' => $request->validated('status')]);

        ActivityLogger::log('Update', 'Inquiries', "Changed inquiry status to {$inquiry->status}", "#{$inquiry->id} | {$inquiry->name}");

        return ApiResponse::success(
            new InquiryResource($inquiry->load(['product', 'notes'])),
            "Status changed to {$inquiry->status}.",
        );
    }

    /** POST /api/admin/inquiries/{inquiry}/notes */
    public function addNote(AddInquiryNoteRequest $request, Inquiry $inquiry)
    {
        $inquiry->notes()->create([
            'author' => $request->user()->name,
            'note' => $request->validated('note'),
        ]);

        ActivityLogger::log('Update', 'Inquiries', 'Added an internal note to an inquiry', "#{$inquiry->id} | {$inquiry->name}");

        return ApiResponse::created(
            new InquiryResource($inquiry->load(['product', 'notes'])),
            'Note added.',
        );
    }

    /**
     * DELETE /api/admin/inquiries/{inquiry}
     * Soft delete, the admin UI calls this "archive", not delete, and the
     * record is fully recoverable from the database if needed.
     */
    public function destroy(Inquiry $inquiry)
    {
        $inquiry->delete();

        ActivityLogger::log('Archive', 'Inquiries', 'Archived an inquiry', "#{$inquiry->id} | {$inquiry->name}");

        return ApiResponse::success(message: 'Inquiry archived.');
    }
}
