<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
use App\Models\Livro;
use App\Models\Autor;
use App\Models\Categoria;

class LivroCrudTest extends TestCase
{
    use RefreshDatabase;
    /**
     * A basic feature test example.
     */

/*
    public function test_example(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }*/

    protected function setUp(): void
    {
        parent::setUp();
        DB::statement('PRAGMA foreign_keys=ON;');
    }


    private function test_payload($autorId, $categoriaId, array $overrides = []) : array {
        return array_merge([
            'autor_id'       => $autorId,
            'categoria_id'   => $categoriaId,
            'titulo'         => 'Livro Teste',
            'slug'           => 'livro-teste',
            'descricao'      => 'Descricao do livro',
            'numero_paginas' =>  250,
            'publicacao'     => '2024-01-01',
            'imagem_capa'    => 'https://teste.com/capa.png',
            'sobre'          => 'conteúdo do livro'
        ], $overrides);
    }

    public function test_it_creates_a_livro(){
        $autor = Autor::factory()->create();
        $categoria = Categoria::factory()->create();
        $response = $this->postJson(
            '/api/livros',
            $this->test_payload($autor->id, $categoria->id)
        );

        $response->assertStatus(201);

        $this->assertDatabaseHas('livros', [
            'titulo'   => 'Livro Teste',
            'autor_id' => $autor->id,
        ]);
    }

    /*
    public function test_it_lists_livros(){
        Livro::factory()->count(3)->create();

        $response = $this->getJson('/api/livros');
        $response->assertStatus(200)->assertJsonCount(3);
    }*/

    public function test_it_shows_a_livro(){
        $livro = Livro::factory()->create();
        $response = $this->getJson("/api/livros/{$livro->id}");
        $response->assertStatus(200)->assertJsonFragment([
            'id'     => $livro->id,
            'titulo' => $livro->titulo,
        ]);
    }

    public function test_it_updates_a_livro(){
        $livro = Livro::factory()->create();
        $response = $this->patchJson(
            "api/livros/{$livro->id}",
            ['titulo' => 'Livro Atualizado']
        );

        $response->assertStatus(200)
             ->assertJsonFragment([
                 'titulo' => 'Livro Atualizado',
             ]);

        $this->assertDatabaseHas('livros', [
            'id' => $livro->id,
            'titulo' => 'Livro Atualizado',
        ]);
    }

    public function test_it_deletes_a_livro(){
        $livro = Livro::factory()->create();
        $response = $this->deleteJson("/api/livros/{$livro->id}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('livros', ['id' => $livro->id]);
    }


}
