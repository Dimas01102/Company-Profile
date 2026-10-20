<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    private function category(): Category
    {
        return Category::factory()->create(['status' => 'Active']);
    }

    public function test_availability_is_computed_from_stock_and_min_stock(): void
    {
        $category = $this->category();

        $outOfStock = Product::factory()->for($category)->create(['stock' => 0, 'min_stock' => 5, 'status' => 'Published']);
        $limited = Product::factory()->for($category)->create(['stock' => 3, 'min_stock' => 5, 'status' => 'Published']);
        $available = Product::factory()->for($category)->create(['stock' => 20, 'min_stock' => 5, 'status' => 'Published']);

        $this->assertSame('Out of Stock', $outOfStock->availability);
        $this->assertSame('Limited Stock', $limited->availability);
        $this->assertSame('Available', $available->availability);
    }

    public function test_public_product_listing_never_includes_draft_or_archived(): void
    {
        $category = $this->category();
        Product::factory()->for($category)->create(['status' => 'Published', 'name' => 'Visible Product']);
        Product::factory()->for($category)->create(['status' => 'Draft', 'name' => 'Hidden Draft']);
        Product::factory()->for($category)->create(['status' => 'Archived', 'name' => 'Hidden Archived']);

        $response = $this->getJson('/api/products')->assertOk();
        $names = collect($response->json('data'))->pluck('name');

        $this->assertContains('Visible Product', $names);
        $this->assertNotContains('Hidden Draft', $names);
        $this->assertNotContains('Hidden Archived', $names);
    }

    public function test_draft_product_detail_404s_exactly_like_a_missing_slug(): void
    {
        $category = $this->category();
        $draft = Product::factory()->for($category)->create(['status' => 'Draft', 'slug' => 'a-draft-product']);

        $draftResponse = $this->getJson("/api/products/{$draft->slug}");
        $missingResponse = $this->getJson('/api/products/does-not-exist');

        $draftResponse->assertStatus(404);
        $missingResponse->assertStatus(404);
        $this->assertSame($draftResponse->json('message'), $missingResponse->json('message'));
    }

    public function test_admin_can_create_a_product_with_specs(): void
    {
        $admin = Admin::factory()->create();
        $category = $this->category();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/products', [
            'name' => 'Test Transformer',
            'sku' => 'TST-0001',
            'slug' => 'test-transformer',
            'category_id' => $category->id,
            'stock' => 10,
            'min_stock' => 2,
            'status' => 'Published',
            'specs' => [
                ['label' => 'Voltage', 'value' => '20 kV'],
            ],
        ]);

        $response->assertCreated()->assertJsonPath('data.name', 'Test Transformer');
        $this->assertDatabaseHas('products', ['sku' => 'TST-0001']);
        $this->assertDatabaseHas('product_specs', ['label' => 'Voltage', 'value' => '20 kV']);
    }

    public function test_creating_a_product_requires_authentication(): void
    {
        $category = $this->category();

        $this->postJson('/api/admin/products', [
            'name' => 'Test Transformer',
            'sku' => 'TST-0002',
            'slug' => 'test-transformer-2',
            'category_id' => $category->id,
            'stock' => 10,
            'min_stock' => 2,
            'status' => 'Published',
        ])->assertStatus(401);
    }

    public function test_deleting_a_product_soft_deletes_it(): void
    {
        $admin = Admin::factory()->create();
        $category = $this->category();
        $product = Product::factory()->for($category)->create();

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/admin/products/{$product->id}")
            ->assertOk();

        $this->assertSoftDeleted('products', ['id' => $product->id]);
    }

    public function test_category_cannot_be_deleted_while_it_still_has_products(): void
    {
        $admin = Admin::factory()->create();
        $category = $this->category();
        Product::factory()->for($category)->create();

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/admin/categories/{$category->id}")
            ->assertStatus(422);

        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }
}
