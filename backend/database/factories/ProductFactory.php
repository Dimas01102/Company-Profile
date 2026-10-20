<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = 'Product '.fake()->unique()->numberBetween(1, 1000000);

        return [
            'name' => $name,
            'sku' => 'SKU-'.fake()->unique()->numberBetween(100000, 999999),
            'product_code' => 'PRD-'.fake()->unique()->numberBetween(1000, 9999),
            'slug' => str($name)->slug(),
            'category_id' => Category::factory(),
            'brand' => fake()->company(),
            'model' => fake()->bothify('Model-###??'),
            'short_description' => fake()->sentence(),
            'stock' => fake()->numberBetween(0, 50),
            'min_stock' => fake()->numberBetween(1, 10),
            'warehouse' => 'Batam Main Plant',
            'status' => 'Published',
            'description' => fake()->paragraph(),
        ];
    }
}
