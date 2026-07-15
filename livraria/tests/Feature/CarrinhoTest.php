<?php

namespace Tests\Feature;

use App\Models\Livro;

class CarrinhoTest extends TestCase
{
    public function test_comprador_pode_adicionar_livro_ao_carrinho(): void
    {
        $auth = $this->loginComoComprador();
        $livro = Livro::factory()->create(['preco' => 39.90]);

        $response = $this->postJson(
            "/api/livros/{$livro->id}/carrinho",
            [],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(201)
            ->assertJsonPath('total_itens', 1)
            ->assertJsonPath('data.0.id', $livro->id);

        $this->assertDatabaseHas('carrinho_itens', [
            'user_id' => $auth['user']->id,
            'livro_id' => $livro->id,
        ]);
    }

    public function test_adicionar_mesmo_livro_nao_duplica_item(): void
    {
        $auth = $this->loginComoComprador();
        $livro = Livro::factory()->create(['preco' => 39.90]);

        $this->postJson("/api/livros/{$livro->id}/carrinho", [], $this->headerComToken($auth['token']));
        $this->postJson("/api/livros/{$livro->id}/carrinho", [], $this->headerComToken($auth['token']));

        $this->assertDatabaseCount('carrinho_itens', 1);
    }

    public function test_comprador_pode_listar_carrinho(): void
    {
        $auth = $this->loginComoComprador();
        $livros = Livro::factory()->count(2)->create(['preco' => 20]);

        $auth['user']->carrinho()->attach($livros->pluck('id')->all());

        $response = $this->getJson('/api/me/carrinho', $this->headerComToken($auth['token']));

        $response->assertStatus(200)
            ->assertJsonPath('total_itens', 2)
            ->assertJsonPath('subtotal', 40)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'titulo', 'preco'],
                ],
                'total_itens',
                'subtotal',
            ]);
    }

    public function test_comprador_pode_remover_livro_do_carrinho(): void
    {
        $auth = $this->loginComoComprador();
        $livro = Livro::factory()->create(['preco' => 39.90]);
        $auth['user']->carrinho()->attach($livro->id);

        $response = $this->deleteJson(
            "/api/livros/{$livro->id}/carrinho",
            [],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJsonPath('total_itens', 0);

        $this->assertDatabaseMissing('carrinho_itens', [
            'user_id' => $auth['user']->id,
            'livro_id' => $livro->id,
        ]);
    }

    public function test_sincronizacao_mescla_carrinho_local_com_o_persistido(): void
    {
        $auth = $this->loginComoComprador();
        $livroPersistido = Livro::factory()->create(['preco' => 20]);
        $livroLocal = Livro::factory()->create(['preco' => 30]);

        $auth['user']->carrinho()->attach($livroPersistido->id);

        $response = $this->postJson(
            '/api/me/carrinho/sincronizar',
            [
                'livros' => [
                    [
                        'livroId' => $livroLocal->id,
                        'titulo' => $livroLocal->titulo,
                        'price' => $livroLocal->preco,
                    ],
                ],
            ],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJsonPath('total_itens', 2)
            ->assertJsonPath('subtotal', 50);

        $this->assertDatabaseHas('carrinho_itens', [
            'user_id' => $auth['user']->id,
            'livro_id' => $livroPersistido->id,
        ]);
        $this->assertDatabaseHas('carrinho_itens', [
            'user_id' => $auth['user']->id,
            'livro_id' => $livroLocal->id,
        ]);
    }

    public function test_carrinho_persistido_e_isolado_por_usuario(): void
    {
        $primeiroComprador = $this->loginComoComprador();
        $segundoComprador = $this->loginComoComprador();
        $livroDoPrimeiro = Livro::factory()->create(['preco' => 20]);
        $livroDoSegundo = Livro::factory()->create(['preco' => 35]);

        $this->actingAs($primeiroComprador['user'], 'api')->postJson(
            "/api/livros/{$livroDoPrimeiro->id}/carrinho",
            []
        )->assertStatus(201);

        $this->actingAs($segundoComprador['user'], 'api')->postJson(
            "/api/livros/{$livroDoSegundo->id}/carrinho",
            []
        )->assertStatus(201);

        $this->actingAs($primeiroComprador['user'], 'api')->getJson('/api/me/carrinho')
            ->assertStatus(200)
            ->assertJsonPath('total_itens', 1)
            ->assertJsonPath('data.0.id', $livroDoPrimeiro->id)
            ->assertJsonMissing(['id' => $livroDoSegundo->id]);

        $this->actingAs($segundoComprador['user'], 'api')->getJson('/api/me/carrinho')
            ->assertStatus(200)
            ->assertJsonPath('total_itens', 1)
            ->assertJsonPath('data.0.id', $livroDoSegundo->id)
            ->assertJsonMissing(['id' => $livroDoPrimeiro->id]);
    }

    public function test_comprador_pode_limpar_carrinho(): void
    {
        $auth = $this->loginComoComprador();
        $livros = Livro::factory()->count(2)->create(['preco' => 20]);
        $auth['user']->carrinho()->attach($livros->pluck('id')->all());

        $response = $this->deleteJson('/api/me/carrinho', [], $this->headerComToken($auth['token']));

        $response->assertStatus(200)
            ->assertJsonPath('total_itens', 0);

        $this->assertDatabaseCount('carrinho_itens', 0);
    }

    public function test_carrinho_persistido_exige_autenticacao(): void
    {
        $livro = Livro::factory()->create();

        $this->postJson("/api/livros/{$livro->id}/carrinho")
            ->assertStatus(401);
    }
}
