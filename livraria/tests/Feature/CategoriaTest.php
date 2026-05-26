<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\TestCase;
use App\Models\Categoria;

class CategoriaTest extends TestCase
{
    private function dadosCategoria(): array
    {
        return [
            'nome' => 'Tecnologia',
            'slug' => 'tecnologia',
        ];
    }

    // --- INDEX ---

    public function test_admin_pode_listar_categorias(): void
    {
        $auth = $this->loginComoAdmin();
        Categoria::factory()->count(3)->create();

        $response = $this->getJson(
            '/api/categorias',
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'meta' => ['total', 'por_pagina', 'pagina_atual', 'ultima_pagina'],
            ]);
    }

    public function test_comprador_nao_pode_listar_categorias(): void
    {
        $auth = $this->loginComoComprador();

        $response = $this->getJson(
            '/api/categorias',
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(403);
    }

    public function test_listagem_falha_sem_autenticacao(): void
    {
        $response = $this->getJson('/api/categorias');

        $response->assertStatus(401);
    }

    // --- SHOW ---

    public function test_admin_pode_visualizar_categoria_especifica(): void
    {
        $auth      = $this->loginComoAdmin();
        $categoria = Categoria::factory()->create();

        $response = $this->getJson(
            "/api/categorias/{$categoria->id}",
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJsonFragment([
                'id'   => $categoria->id,
                'nome' => $categoria->nome,
            ]);
    }

    public function test_comprador_nao_pode_visualizar_categoria_especifica(): void
    {
        $auth      = $this->loginComoComprador();
        $categoria = Categoria::factory()->create();

        $response = $this->getJson(
            "/api/categorias/{$categoria->id}",
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(403);
    }

    // --- STORE ---

    public function test_admin_pode_criar_categoria(): void
    {
        $auth = $this->loginComoAdmin();

        $response = $this->postJson(
            '/api/categorias',
            $this->dadosCategoria(),
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(201)
            ->assertJsonFragment([
                'nome' => 'Tecnologia',
                'slug' => 'tecnologia',
            ]);

        $this->assertDatabaseHas('categorias', [
            'nome' => 'Tecnologia',
            'slug' => 'tecnologia',
        ]);
    }

    public function test_slug_e_gerado_automaticamente_quando_omitido(): void
    {
        $auth = $this->loginComoAdmin();

        $response = $this->postJson(
            '/api/categorias',
            ['nome' => 'Programação Web'],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(201)
            ->assertJsonFragment(['slug' => 'programacao-web']);

        $this->assertDatabaseHas('categorias', [
            'slug' => 'programacao-web',
        ]);
    }

    public function test_comprador_nao_pode_criar_categoria(): void
    {
        $auth = $this->loginComoComprador();

        $response = $this->postJson(
            '/api/categorias',
            $this->dadosCategoria(),
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(403);
    }

    public function test_criacao_falha_com_slug_duplicado(): void
    {
        $auth = $this->loginComoAdmin();
        Categoria::factory()->create(['slug' => 'tecnologia']);

        $response = $this->postJson(
            '/api/categorias',
            $this->dadosCategoria(),
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
    }

    public function test_criacao_falha_sem_campos_obrigatorios(): void
    {
        $auth = $this->loginComoAdmin();

        $response = $this->postJson(
            '/api/categorias',
            [],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nome']);
    }

    public function test_criacao_falha_sem_autenticacao(): void
    {
        $response = $this->postJson('/api/categorias', $this->dadosCategoria());

        $response->assertStatus(401);
    }

    // --- UPDATE ---

    public function test_admin_pode_atualizar_categoria(): void
    {
        $auth      = $this->loginComoAdmin();
        $categoria = Categoria::factory()->create();

        $response = $this->putJson(
            "/api/categorias/{$categoria->id}",
            [
                'nome' => 'Tecnologia e Inovação',
                'slug' => 'tecnologia-e-inovacao',
            ],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJsonFragment([
                'nome' => 'Tecnologia e Inovação',
                'slug' => 'tecnologia-e-inovacao',
            ]);

        $this->assertDatabaseHas('categorias', [
            'id'   => $categoria->id,
            'nome' => 'Tecnologia e Inovação',
        ]);
    }

    public function test_comprador_nao_pode_atualizar_categoria(): void
    {
        $auth      = $this->loginComoComprador();
        $categoria = Categoria::factory()->create();

        $response = $this->putJson(
            "/api/categorias/{$categoria->id}",
            ['nome' => 'Nome Atualizado'],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(403);
    }

    public function test_atualizacao_nao_conflita_com_slug_do_proprio_registro(): void
    {
        $auth      = $this->loginComoAdmin();
        $categoria = Categoria::factory()->create([
            'nome' => 'Tecnologia',
            'slug' => 'tecnologia',
        ]);

        // Atualizar o nome mantendo o mesmo slug não deve dar erro
        $response = $this->putJson(
            "/api/categorias/{$categoria->id}",
            [
                'nome' => 'Tecnologia Atualizada',
                'slug' => 'tecnologia',
            ],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200);
    }

    public function test_atualizacao_retorna_404_para_categoria_inexistente(): void
    {
        $auth = $this->loginComoAdmin();

        $response = $this->putJson(
            '/api/categorias/999',
            ['nome' => 'Nome Qualquer'],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(404);
    }

    // --- DESTROY ---

    public function test_admin_pode_deletar_categoria(): void
    {
        $auth      = $this->loginComoAdmin();
        $categoria = Categoria::factory()->create();

        $response = $this->deleteJson(
            "/api/categorias/{$categoria->id}",
            [],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(204);

        $this->assertDatabaseMissing('categorias', [
            'id' => $categoria->id,
        ]);
    }

    public function test_comprador_nao_pode_deletar_categoria(): void
    {
        $auth      = $this->loginComoComprador();
        $categoria = Categoria::factory()->create();

        $response = $this->deleteJson(
            "/api/categorias/{$categoria->id}",
            [],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(403);
    }

    public function test_exclusao_retorna_404_para_categoria_inexistente(): void
    {
        $auth = $this->loginComoAdmin();

        $response = $this->deleteJson(
            '/api/categorias/999',
            [],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(404);
    }
}
