<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\TestCase;
use App\Models\Autor;

class AutorTest extends TestCase
{
    private function dadosAutor(): array
    {
        return [
            'nome'  => 'Martin Fowler',
            'sobre' => 'Autor e palestrante renomado na área de engenharia de software, conhecido por seus trabalhos sobre arquitetura e refatoração.',
        ];
    }

    // --- INDEX ---

    public function test_admin_pode_listar_autores(): void
    {
        $auth = $this->loginComoAdmin();
        Autor::factory()->count(3)->create();

        $response = $this->getJson(
            '/api/autores',
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'meta' => ['total', 'por_pagina', 'pagina_atual', 'ultima_pagina'],
            ]);
    }

    public function test_comprador_nao_pode_listar_autores(): void
    {
        $auth = $this->loginComoComprador();

        $response = $this->getJson(
            '/api/autores',
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(403);
    }

    public function test_listagem_falha_sem_autenticacao(): void
    {
        $response = $this->getJson('/api/autores');

        $response->assertStatus(401);
    }

    // --- SHOW ---

    public function test_admin_pode_visualizar_autor_especifico(): void
    {
        $auth  = $this->loginComoAdmin();
        $autor = Autor::factory()->create();

        $response = $this->getJson(
            "/api/autores/{$autor->id}",
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJsonFragment([
                'id'   => $autor->id,
                'nome' => $autor->nome,
            ]);
    }

    public function test_comprador_nao_pode_visualizar_autor_especifico(): void
    {
        $auth  = $this->loginComoComprador();
        $autor = Autor::factory()->create();

        $response = $this->getJson(
            "/api/autores/{$autor->id}",
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(403);
    }

    // --- STORE ---

    public function test_admin_pode_criar_autor(): void
    {
        $auth = $this->loginComoAdmin();

        $response = $this->postJson(
            '/api/autores',
            $this->dadosAutor(),
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(201)
            ->assertJsonFragment(['nome' => 'Martin Fowler']);

        $this->assertDatabaseHas('autores', [
            'nome' => 'Martin Fowler',
        ]);
    }

    public function test_comprador_nao_pode_criar_autor(): void
    {
        $auth = $this->loginComoComprador();

        $response = $this->postJson(
            '/api/autores',
            $this->dadosAutor(),
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(403);
    }

    public function test_criacao_falha_sem_campos_obrigatorios(): void
    {
        $auth = $this->loginComoAdmin();

        $response = $this->postJson(
            '/api/autores',
            [],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nome', 'sobre']);
    }

    public function test_criacao_falha_sem_autenticacao(): void
    {
        $response = $this->postJson('/api/autores', $this->dadosAutor());

        $response->assertStatus(401);
    }

    // --- UPDATE ---

    public function test_admin_pode_atualizar_autor(): void
    {
        $auth  = $this->loginComoAdmin();
        $autor = Autor::factory()->create();

        $response = $this->putJson(
            "/api/autores/{$autor->id}",
            ['nome' => 'Robert C. Martin'],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJsonFragment(['nome' => 'Robert C. Martin']);

        $this->assertDatabaseHas('autores', [
            'id'   => $autor->id,
            'nome' => 'Robert C. Martin',
        ]);
    }

    public function test_comprador_nao_pode_atualizar_autor(): void
    {
        $auth  = $this->loginComoComprador();
        $autor = Autor::factory()->create();

        $response = $this->putJson(
            "/api/autores/{$autor->id}",
            ['nome' => 'Nome Atualizado'],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(403);
    }

    public function test_atualizacao_retorna_404_para_autor_inexistente(): void
    {
        $auth = $this->loginComoAdmin();

        $response = $this->putJson(
            '/api/autores/999',
            ['nome' => 'Nome Qualquer'],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(404);
    }

    // --- DESTROY ---

    public function test_admin_pode_deletar_autor(): void
    {
        $auth  = $this->loginComoAdmin();
        $autor = Autor::factory()->create();

        $response = $this->deleteJson(
            "/api/autores/{$autor->id}",
            [],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(204);

        $this->assertDatabaseMissing('autores', [
            'id' => $autor->id,
        ]);
    }

    public function test_comprador_nao_pode_deletar_autor(): void
    {
        $auth  = $this->loginComoComprador();
        $autor = Autor::factory()->create();

        $response = $this->deleteJson(
            "/api/autores/{$autor->id}",
            [],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(403);
    }

    public function test_exclusao_retorna_404_para_autor_inexistente(): void
    {
        $auth = $this->loginComoAdmin();

        $response = $this->deleteJson(
            '/api/autores/999',
            [],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(404);
    }
}
