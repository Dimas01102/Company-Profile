<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\NewsResource;
use App\Models\News;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    /** GET /api/news?search=&category=&featured=&per_page= */
    public function index(Request $request)
    {
        $query = News::query()->published();

        if ($search = $request->string('search')->trim()->value()) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($category = $request->string('category')->trim()->value()) {
            $query->where('category', $category);
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        $news = $query->orderByDesc('published_date')->paginate($request->integer('per_page', 9));

        return ApiResponse::success(
            NewsResource::collection($news),
            meta: [
                'current_page' => $news->currentPage(),
                'last_page' => $news->lastPage(),
                'total' => $news->total(),
            ],
        );
    }

    /**
     * GET /api/news/{slug}
     * Draft, and Published-but-not-yet-scheduled, articles 404 exactly
     * like a nonexistent slug, see News::scopePublished().
     */
    public function show(string $slug)
    {
        $article = News::query()
            ->published()
            ->where('slug', $slug)
            ->with('galleryImages')
            ->firstOrFail();

        $data = (new NewsResource($article))->toArray(request());
        $data['related'] = NewsResource::collection($article->relatedArticles());

        return ApiResponse::success($data);
    }
}
