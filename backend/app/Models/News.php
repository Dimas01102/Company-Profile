<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class News extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'category', 'author', 'published_date', 'read_time',
        'summary', 'content', 'thumbnail_path', 'tags', 'featured', 'status',
        'scheduled_at', 'meta_title', 'meta_description', 'meta_keywords',
    ];

    protected function casts(): array
    {
        return [
            'published_date' => 'date',
            'tags' => 'array',
            'featured' => 'boolean',
            'scheduled_at' => 'datetime',
        ];
    }

    public function galleryImages(): HasMany
    {
        return $this->hasMany(NewsGalleryImage::class)->orderBy('order');
    }


    public function scopePublished(Builder $query)
    {
        return $query->where('status', 'Published')
            ->where(function ($q) {
                $q->whereNull('scheduled_at')->orWhere('scheduled_at', '<=', Carbon::now());
            });
    }

    /**
     * Whether the public site can show this article right now: Published,
     * and its scheduled time (if any) has passed.
     */
    public function isLive(): bool
    {
        return $this->status === 'Published'
            && ($this->scheduled_at === null || $this->scheduled_at->lte(Carbon::now()));
    }

    /** "4 min read", from the article body (about 200 words per minute). */
    public static function estimateReadTime(?string $content): string
    {
        $words = str_word_count(strip_tags((string) $content));
        $minutes = max(1, (int) ceil($words / 200));

        return $minutes.' min read';
    }

    public function scopeFeatured(Builder $query)
    {
        return $query->where('featured', true);
    }

    public function relatedArticles(int $limit = 3)
    {
        return static::query()
            ->published()
            ->where('id', '!=', $this->id)
            ->where('category', $this->category)
            ->latest('published_date')
            ->limit($limit)
            ->get();
    }
}
