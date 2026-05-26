<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\TestCase;
use App\Models\User;

class UserTest extends TestCase
{
   // --- LISTAGEM ---

    public function test_admin_pode_listar_usuarios(): void
    {
        $auth = $this->loginComoAdmin();
        User::factory()->count(3)->create();

        $response = $this->getJson(
            '/api/usuarios',
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_comprador_nao_pode_listar_usuarios(): void
    {
        $auth = $this->loginComoComprador();

        $response = $this->getJson(
            '/api/usuarios',
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(403);
    }

    // --- EDITAR A SI MESMO ---

    public function test_comprador_pode_editar_a_si_mesmo(): void
    {
        $auth = $this->loginComoComprador();

        $response = $this->putJson(
            '/api/me',
            ['name' => 'Nome Atualizado'],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJsonFragment(['nome' => 'Nome Atualizado']);
    }

    // --- DELETAR A SI MESMO ---

    public function test_comprador_pode_deletar_a_si_mesmo(): void
    {
        $auth = $this->loginComoComprador();

        $response = $this->deleteJson(
            '/api/me',
            [],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(204);

        $this->assertDatabaseMissing('users', [
            'id' => $auth['user']->id,
        ]);
    }

    // --- ADMIN NÃO PODE DELETAR A SI MESMO ---

    public function test_comprador_nao_pode_deletar_outro_usuario(): void
    {
        $auth   = $this->loginComoComprador();
        $outro  = User::factory()->create();
        $outro->assignRole('comprador');

        $response = $this->deleteJson(
            "/api/usuarios/{$outro->id}",
            [],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(403);
    }
}
