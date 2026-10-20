<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Employee;
use App\Models\GalleryItem;
use App\Models\Inquiry;
use App\Models\News;
use App\Models\Product;
use App\Support\ApiResponse;

class DashboardController extends Controller
{
    /** GET /api/admin/dashboard */
    public function index()
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();

        $stats = [
            [
                'key' => 'products',
                'label' => 'Products',
                'value' => Product::count(),
                'delta' => $this->deltaLabel(Product::where('created_at', '>=', $startOfMonth)->count(), 'this month'),
                'hint' => Category::count().' categories active',
                'icon' => 'Package',
                'to' => '/admin/products',
            ],
            [
                'key' => 'employees',
                'label' => 'Employees',
                'value' => Employee::count(),
                'delta' => 'No change',
                'hint' => 'Management team profiles',
                'icon' => 'Users',
                'to' => '/admin/employees',
            ],
            [
                'key' => 'news',
                'label' => 'News Articles',
                'value' => News::count(),
                'delta' => $this->deltaLabel(News::where('created_at', '>=', $startOfMonth)->count(), 'this month'),
                'hint' => News::where('featured', true)->count().' featured article(s)',
                'icon' => 'Newspaper',
                'to' => '/admin/news',
            ],
            [
                'key' => 'gallery',
                'label' => 'Gallery Items',
                'value' => GalleryItem::count(),
                'delta' => $this->deltaLabel(GalleryItem::where('created_at', '>=', $startOfMonth)->count(), 'this month'),
                'hint' => GalleryItem::where('is_video', true)->count().' video(s) included',
                'icon' => 'Images',
                'to' => '/admin/gallery',
            ],
            [
                'key' => 'inquiries',
                'label' => 'Inquiries',
                'value' => Inquiry::count(),
                'delta' => $this->deltaLabel(Inquiry::where('created_at', '>=', $now->copy()->startOfWeek())->count(), 'this week'),
                'hint' => Inquiry::where('status', 'New')->count().' awaiting reply',
                'icon' => 'Inbox',
                'to' => '/admin/inquiries',
            ],
        ];

        $trend = collect(range(6, 0))->map(function ($monthsAgo) use ($now) {
            $month = $now->copy()->subMonths($monthsAgo);
            $start = $month->copy()->startOfMonth();
            $end = $month->copy()->endOfMonth();

            return [
                'month' => $month->format('M'),
                'inquiries' => Inquiry::whereBetween('created_at', [$start, $end])->count(),
                'quotations' => Inquiry::whereBetween('created_at', [$start, $end])
                    ->whereIn('status', ['In Progress', 'Completed'])
                    ->count(),
            ];
        })->values();

        $inquiries = Inquiry::query()->latest()->take(5)->get()->map(fn (Inquiry $inquiry) => [
            'id' => 'INQ-'.$inquiry->id,
            'company' => $inquiry->company ?: '-',
            'contact' => $inquiry->name,
            'subject' => $inquiry->subject ?: $inquiry->message,
            'product' => $inquiry->product?->name ?? '',
            'status' => $inquiry->status,
            'receivedAt' => $inquiry->created_at?->format('Y-m-d H:i'),
        ]);

        $activities = ActivityLog::query()->latest()->take(6)->get()->map(fn (ActivityLog $log) => [
            'id' => $log->id,
            'actor' => $log->admin_name,
            'action' => $log->description,
            'target' => $log->affected_data,
            'at' => $log->created_at?->diffForHumans(),
        ]);

        $products = Product::with('category')->latest()->take(5)->get()->map(fn (Product $product) => [
            'id' => $product->id,
            'slug' => $product->slug,
            'name' => $product->name,
            'brand' => $product->brand,
            'category' => $product->category?->name ?? '',
            'image' => $product->main_image_path ? asset('storage/'.$product->main_image_path) : null,
        ]);

        $news = News::query()->latest('published_date')->take(4)->get()->map(fn (News $article) => [
            'id' => $article->id,
            'title' => $article->title,
            'category' => $article->category,
            'date' => $article->published_date?->toDateString(),
            'author' => $article->author,
        ]);

        return ApiResponse::success([
            'stats' => $stats,
            'trend' => $trend,
            'inquiries' => $inquiries,
            'activities' => $activities,
            'products' => $products,
            'news' => $news,
        ]);
    }

    private function deltaLabel(int $count, string $period): string
    {
        return $count > 0 ? "+{$count} {$period}" : 'No change';
    }
}
