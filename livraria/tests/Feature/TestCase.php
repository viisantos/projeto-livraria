<?php
namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

abstract class TestCase extends BaseTestCase {
    use RefreshDatabase;

    protected function loginComoAdmin(): array {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $this->app['auth']->forgetGuards();
        $token = JWTAuth::fromUser($admin);

        return ['user' => $admin, 'token' => $token];
    }

    protected function loginComoComprador(): array {
        $comprador = User::factory()->create();
        $comprador->assignRole('comprador');
        $this->app['auth']->forgetGuards();
        $token = JWTAuth::fromUser($comprador);
        return ['user' => $comprador, 'token' => $token];
    }

    protected function headerComToken(string $token): array {
        $this->app['auth']->forgetGuards();

        return [
            'Authorization' => "Bearer {$token}",
            'Accept'        => 'application/json'
        ];
    }

    protected function setUp(): void {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    }
}
