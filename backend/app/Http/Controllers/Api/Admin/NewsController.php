<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\NewsRequest;
use App\Http\Resources\NewsResource;
use App\Models\News;
use App\Models\NewsGalleryImage;
use App\Support\ActivityLogger;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class NewsController extends Controller
{
    /** GET /api/admin/news?search=&category=&status=&date_from=&date_to=&sort=&direction=&per_page= */
    public function index(Request $request)
    {
        $query = News::query()->with('galleryImages');

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%")
                    ->orWhere('summary', 'like', "%{$search}%");
            });
        }

        if ($category = $request->string('category')->trim()->value()) {
            $query->where('category', $category);
        }

        if ($status = $request->string('status')->trim()->value()) {
            $query->where('status', $status);
        }

        if ($from = $request->string('date_from')->trim()->value()) {
            $query->whereDate('published_date', '>=', $from);
        }

        if ($to = $request->string('date_to')->trim()->value()) {
            $query->whereDate('published_date', '<=', $to);
        }

        $sort = in_array($request->string('sort')->value(), ['title', 'published_date', 'status'])
            ? $request->string('sort')->value()
            : 'published_date';
        $direction = $request->string('direction')->value() === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $direction);

        $news = $query->paginate($request->integer('per_page', 8));

        return ApiResponse::success(
            NewsResource::collection($news),
            meta: [
                'current_page' => $news->currentPage(),
                'last_page' => $news->lastPage(),
                'total' => $news->total(),
            ],
        );
    }

    /** POST /api/admin/news */
    public function store(NewsRequest $request)
    {
        $article = DB::transaction(function () use ($request) {
            $data = $request->safe()->except(['thumbnail', 'remove_thumbnail', 'gallery', 'remove_gallery_ids', 'tags', 'read_time']);
            $data['tags'] = $this->tagsToArray($request->input('tags'));
            // Read time is always derived from the content, never typed in.
            $data['read_time'] = News::estimateReadTime($request->input('content'));

            if ($request->hasFile('thumbnail')) {
                $data['thumbnail_path'] = $request->file('thumbnail')->store('news', 'public');
            }

            $article = News::create($data);
            $this->addGalleryImages($article, (array) $request->file('gallery', []));

            return $article;
        });

        ActivityLogger::log('Create', 'News', 'Created a news article', $article->title);

        return ApiResponse::created($this->fullResource($article), 'Article created.');
    }

    /** GET /api/admin/news/{news} */
    public function show(News $news)
    {
        return ApiResponse::success($this->fullResource($news));
    }

    /** PUT /api/admin/news/{news} */
    public function update(NewsRequest $request, News $news)
    {
        DB::transaction(function () use ($request, $news) {
            $data = $request->safe()->except(['thumbnail', 'remove_thumbnail', 'gallery', 'remove_gallery_ids', 'tags', 'read_time']);
            $data['tags'] = $this->tagsToArray($request->input('tags'));
            // Read time is always derived from the content, never typed in.
            $data['read_time'] = News::estimateReadTime($request->input('content'));

            if ($request->hasFile('thumbnail')) {
                if ($news->thumbnail_path) {
                    Storage::disk('public')->delete($news->thumbnail_path);
                }
                $data['thumbnail_path'] = $request->file('thumbnail')->store('news', 'public');
            } elseif ($request->boolean('remove_thumbnail') && $news->thumbnail_path) {
                Storage::disk('public')->delete($news->thumbnail_path);
                $data['thumbnail_path'] = null;
            }

            $news->update($data);

            if ($request->filled('remove_gallery_ids')) {
                $images = NewsGalleryImage::whereIn('id', $request->input('remove_gallery_ids'))
                    ->where('news_id', $news->id)
                    ->get();
                foreach ($images as $image) {
                    Storage::disk('public')->delete($image->image_path);
                    $image->delete();
                }
            }
            $this->addGalleryImages($news, (array) $request->file('gallery', []));
        });

        ActivityLogger::log('Update', 'News', 'Updated a news article', $news->title);

        return ApiResponse::success($this->fullResource($news->fresh()), 'Article updated.');
    }

    /** DELETE /api/admin/news/{news} */
    public function destroy(News $news)
    {
        $suffix = '--deleted-'.$news->id;
        $news->forceFill([
            'slug' => mb_substr($news->slug, 0, 255 - mb_strlen($suffix)).$suffix,
        ])->saveQuietly();
        $news->delete();

        ActivityLogger::log('Delete', 'News', 'Deleted a news article', $news->title);

        return ApiResponse::success(message: 'Article deleted.');
    }

    /** PATCH /api/admin/news/{news}/status */
    public function updateStatus(Request $request, News $news)
    {
        $request->validate(['status' => ['required', Rule::in(['Draft', 'Published'])]]);

        $news->update(['status' => $request->input('status')]);

        ActivityLogger::log(
            $request->input('status') === 'Published' ? 'Publish' : 'Unpublish',
            'News',
            $request->input('status') === 'Published' ? 'Published a news article' : 'Unpublished a news article',
            $news->title,
        );

        return ApiResponse::success(
            $this->fullResource($news),
            $request->input('status') === 'Published' ? 'Article published.' : 'Article unpublished.',
        );
    }

    private function tagsToArray(?string $tags): array
    {
        if (! $tags) {
            return [];
        }

        return collect(explode(',', $tags))
            ->map(fn ($t) => trim($t))
            ->filter()
            ->values()
            ->all();
    }

    private function addGalleryImages(News $news, array $files): void
    {
        $nextOrder = (int) $news->galleryImages()->max('order') + 1;
        foreach ($files as $file) {
            $news->galleryImages()->create([
                'image_path' => $file->store('news/gallery', 'public'),
                'order' => $nextOrder++,
            ]);
        }
    }

    private function fullResource(News $news): NewsResource
    {
        return new NewsResource($news->load('galleryImages'));
    }
}