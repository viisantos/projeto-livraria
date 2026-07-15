<?php

namespace Tests\Feature;

use App\Models\Livro;

class FavoritoTest extends TestCase
{
    public function test_comprador_pode_favoritar_livro(): void
    {
        $auth = $this->loginComoComprador();
        $livro = Livro::factory()->create();

        $response = $this->postJson(
            "/api/livros/{$livro->id}/favoritar",
            [],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(201)
            ->assertJsonPath('favorito', true)
            ->assertJsonPath('livro.id', $livro->id);

        $this->assertDatabaseHas('livro_user', [
            'user_id' => $auth['user']->id,
            'livro_id' => $livro->id,
        ]);
    }

    public function test_favoritar_livro_mais_de_uma_vez_nao_duplica_registro(): void
    {
        $auth = $this->loginComoComprador();
        $livro = Livro::factory()->create();

        $this->postJson(
            "/api/livros/{$livro->id}/favoritar",
            [],
            $this->headerComToken($auth['token'])
        );
        $this->postJson(
            "/api/livros/{$livro->id}/favoritar",
            [],
            $this->headerComToken($auth['token'])
        );

        $this->assertDatabaseCount('livro_user', 1);
    }

    public function test_comprador_pode_listar_favoritos(): void
    {
        $auth = $this->loginComoComprador();
        $livros = Livro::factory()->count(2)->create();

        $auth['user']->favoritos()->attach($livros->pluck('id')->all());

        $response = $this->getJson(
            '/api/me/favoritos',
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'titulo', 'autor', 'categoria', 'preco'],
                ],
                'meta' => ['total', 'por_pagina', 'pagina_atual', 'ultima_pagina'],
            ])
            ->assertJsonMissingPath('data.0.estoque');
    }

    public function test_comprador_pode_verificar_se_livro_esta_favoritado(): void
    {
        $auth = $this->loginComoComprador();
        $livro = Livro::factory()->create();

        $auth['user']->favoritos()->attach($livro->id);

        $response = $this->getJson(
            "/api/livros/{$livro->id}/favorito",
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJson([
                'livro_id' => $livro->id,
                'favorito' => true,
            ]);
    }

    public function test_comprador_pode_remover_livro_dos_favoritos(): void
    {
        $auth = $this->loginComoComprador();
        $livro = Livro::factory()->create();
        $auth['user']->favoritos()->attach($livro->id);

        $response = $this->deleteJson(
            "/api/livros/{$livro->id}/favoritar",
            [],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJsonPath('favorito', false);

        $this->assertDatabaseMissing('livro_user', [
            'user_id' => $auth['user']->id,
            'livro_id' => $livro->id,
        ]);
    }

    public function test_favoritos_exigem_autenticacao(): void
    {
        $livro = Livro::factory()->create();

        $this->postJson("/api/livros/{$livro->id}/favoritar")
            ->assertStatus(401);
    }
}
