<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Inquiry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InquiryTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'subject' => 'Quotation request',
            'message' => 'Please send a quotation for a 1000 kVA transformer.',
        ], $overrides);
    }

    public function test_visitor_can_submit_the_contact_form_without_authentication(): void
    {
        $response = $this->postJson('/api/contact', $this->payload());

        $response->assertCreated()->assertJsonPath('success', true);
        $this->assertDatabaseHas('inquiries', ['email' => 'budi@example.com', 'source' => 'Contact Page']);
    }

    public function test_contact_form_validates_required_fields(): void
    {
        $this->postJson('/api/contact', ['name' => 'Budi'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'subject', 'message']);
    }

    public function test_product_inquiry_requires_a_valid_source(): void
    {
        $this->postJson('/api/inquiries', $this->payload(['source' => 'Not A Real Source']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['source']);
    }

    public function test_contact_endpoint_is_rate_limited(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/contact', $this->payload(['email' => "visitor{$i}@example.com"]));
        }

        $this->postJson('/api/contact', $this->payload(['email' => 'once-too-many@example.com']))
            ->assertStatus(429);
    }

    public function test_admin_can_change_status_and_add_a_note(): void
    {
        $admin = Admin::factory()->create(['name' => 'Siti Rahayu']);
        $inquiry = Inquiry::factory()->create(['status' => 'New']);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/inquiries/{$inquiry->id}/status", ['status' => 'Contacted'])
            ->assertOk()
            ->assertJsonPath('data.status', 'Contacted');

        $noteResponse = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/inquiries/{$inquiry->id}/notes", ['note' => 'Called the client.']);

        $noteResponse->assertCreated();
        $this->assertDatabaseHas('inquiry_notes', ['inquiry_id' => $inquiry->id, 'author' => 'Siti Rahayu']);
    }

    public function test_archiving_an_inquiry_soft_deletes_it(): void
    {
        $admin = Admin::factory()->create();
        $inquiry = Inquiry::factory()->create();

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/admin/inquiries/{$inquiry->id}")
            ->assertOk();

        $this->assertSoftDeleted('inquiries', ['id' => $inquiry->id]);
    }

    public function test_inquiry_management_requires_authentication(): void
    {
        $inquiry = Inquiry::factory()->create();

        $this->getJson("/api/admin/inquiries/{$inquiry->id}")->assertStatus(401);
    }
}
