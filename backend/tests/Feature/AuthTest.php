<?php

namespace Tests\Feature;

use App\Models\Admin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_log_in_with_correct_credentials(): void
    {
        $admin = Admin::factory()->create(['password' => Hash::make('correct-password')]);

        $response = $this->postJson('/api/admin/login', [
            'email' => $admin->email,
            'password' => 'correct-password',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['token', 'token_type', 'expires_at', 'admin' => ['id', 'email']]]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $admin = Admin::factory()->create(['password' => Hash::make('correct-password')]);

        $response = $this->postJson('/api/admin/login', [
            'email' => $admin->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_login_never_reveals_whether_the_email_exists(): void
    {
        $unknown = $this->postJson('/api/admin/login', [
            'email' => 'nobody@example.com',
            'password' => 'whatever',
        ]);

        $admin = Admin::factory()->create(['password' => Hash::make('correct-password')]);
        $wrongPassword = $this->postJson('/api/admin/login', [
            'email' => $admin->email,
            'password' => 'whatever',
        ]);

        $this->assertSame(
            $unknown->json('errors.email.0'),
            $wrongPassword->json('errors.email.0'),
        );
    }

    public function test_protected_routes_reject_requests_without_a_token(): void
    {
        $this->getJson('/api/admin/me')->assertStatus(401)->assertJsonPath('success', false);
    }

    public function test_authenticated_admin_can_fetch_their_own_profile(): void
    {
        $admin = Admin::factory()->create();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/me')
            ->assertOk()
            ->assertJsonPath('data.email', $admin->email);
    }

    public function test_logout_revokes_only_the_current_token(): void
    {
        $admin = Admin::factory()->create(['password' => Hash::make('correct-password')]);

        $login = $this->postJson('/api/admin/login', [
            'email' => $admin->email,
            'password' => 'correct-password',
        ]);
        $token = $login->json('data.token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/admin/logout')
            ->assertOk();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/me')
            ->assertStatus(401);
    }

    public function test_login_is_rate_limited(): void
    {
        $admin = Admin::factory()->create(['password' => Hash::make('correct-password')]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/admin/login', ['email' => $admin->email, 'password' => 'wrong']);
        }

        $this->postJson('/api/admin/login', ['email' => $admin->email, 'password' => 'wrong'])
            ->assertStatus(429);
    }
}
