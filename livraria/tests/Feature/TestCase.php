<?php
namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase {
    use RefreshDatabase;

    protected function loginComoAdmin(): array {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $token = auth('api')->login($admin);

        return ['user' => $admin, 'token' => $token];
    }

    protected function loginComoComprador(): array {
        $comprador = User::factory()->create();
        $comprador->assignRole('comprador');
        $token = auth('api')->login($comprador);
        return ['user' => $comprador, 'token' => $token];
    }

    protected function headerComToken(string $token): array {
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
