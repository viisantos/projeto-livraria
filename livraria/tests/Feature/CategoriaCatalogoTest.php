<?php

namespace Tests\Feature;

use App\Models\Categoria;

class CategoriaCatalogoTest extends TestCase
{
    public function test_comprador_pode_listar_categorias_do_catalogo(): void
    {
        $auth = $this->loginComoComprador();
        $categoria = Categoria::factory()->create([
            'nome' => 'Ficção',
            'slug' => 'ficcao',
        ]);

        $response = $this->getJson('/api/catalogo/categorias?per_page=100', $this->headerComToken($auth['token']));

        $response->assertStatus(200)
            ->assertJsonPath('data.0.id', $categoria->id)
            ->assertJsonPath('data.0.nome', 'Ficção');
    }

    public function test_categorias_do_catalogo_respeitam_paginacao_maxima(): void
    {
        $auth = $this->loginComoComprador();
        Categoria::factory()->count(101)->create();

        $response = $this->getJson(
            '/api/catalogo/categorias?per_page=500',
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJsonCount(100, 'data')
            ->assertJsonPath('meta.por_pagina', 100);
    }

    public function test_comprador_nao_pode_criar_categoria(): void
    {
        $auth = $this->loginComoComprador();

        $this->postJson(
            '/api/categorias',
            ['nome' => 'Restrita', 'slug' => 'restrita'],
            $this->headerComToken($auth['token'])
        )->assertStatus(403);
    }
}
