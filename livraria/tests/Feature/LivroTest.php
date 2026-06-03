<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\TestCase;

use App\Models\Autor;
use App\Models\Categoria;
use App\Models\Livro;


class LivroTest extends TestCase
{
    /**
     * A basic feature test example.
     */
    /*
    public function test_example(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }*/

    private function dadosLivro(int $autorId, int $categoriaId): array {
        return [
            'titulo'         => 'Introdução ao desenvolvimento web volume 2',
            'slug'           => 'introducao-ao-desenvolvimento-web',
            'descricao'      => 'Um livro completo para iniciantes no seu volumne 2',
            'isbn'           => '978-85-99999-00-1',
            'numero_paginas' => 320,
            'publicacao'     => '2023-06-01',
            'imagem_capa'    => 'https://meusite.com/capas/web.png',
            'sobre'          => 'Aborda HTML, CSS e JavaScript.',
            'autor_id'       => $autorId,
            'categoria_id'   => $categoriaId,
            'preco'          => 59.90,
            'estoque'        => 10,
        ];
    }

    public function test_admin_pode_listar_livros(){
        $auth = $this->loginComoAdmin();
        Livro::factory()->count(3)->create();
        $response = $this->getJson(
            '/api/livros',
            $this->headerComToken($auth['token'])
        );
        $response->assertStatus(200)
            ->assertJsonStructure([
            'data',
            'meta' => ['total','por_pagina','pagina_atual', 'ultima_pagina'],
            ]);
    }

    public function test_comprador_pode_listar_livros(): void{
        $auth = $this->loginComoComprador();
        Livro::factory()->count(3)->create();
        $response = $this->getJson(
            '/api/livros',
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200);
    }

    public function test_listagem_falha_sem_autenticacao(){
        $response = $this->getJson('/api/livros');
        $response->assertStatus(401);
    }

    public function test_comprador_pode_filtrar_catalogo(): void
    {
        $auth = $this->loginComoComprador();
        $categoriaTecnologia = Categoria::factory()->create([
            'nome' => 'Tecnologia',
            'slug' => 'tecnologia',
        ]);
        $categoriaRomance = Categoria::factory()->create([
            'nome' => 'Romance',
            'slug' => 'romance',
        ]);
        $autor = Autor::factory()->create(['nome' => 'Robert Martin']);

        $livroEsperado = Livro::factory()->create([
            'autor_id' => $autor->id,
            'categoria_id' => $categoriaTecnologia->id,
            'titulo' => 'Codigo Limpo',
            'descricao' => 'Boas praticas de desenvolvimento',
            'preco' => 89.90,
            'estoque' => 8,
        ]);

        Livro::factory()->create([
            'categoria_id' => $categoriaRomance->id,
            'titulo' => 'Romance Sem Estoque',
            'preco' => 49.90,
            'estoque' => 0,
        ]);

        Livro::factory()->create([
            'categoria_id' => $categoriaTecnologia->id,
            'titulo' => 'Livro Muito Caro',
            'preco' => 180.00,
            'estoque' => 5,
        ]);

        $response = $this->getJson(
            '/api/catalogo?busca=Codigo&categoria=tecnologia&min_preco=50&max_preco=100&disponivel=1',
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $livroEsperado->id);
    }

    public function test_catalogo_pode_ordenar_por_menor_preco(): void
    {
        $auth = $this->loginComoComprador();

        $livroCaro = Livro::factory()->create([
            'titulo' => 'Livro Caro',
            'preco' => 120.00,
            'estoque' => 3,
        ]);
        $livroBarato = Livro::factory()->create([
            'titulo' => 'Livro Barato',
            'preco' => 25.00,
            'estoque' => 4,
        ]);

        $response = $this->getJson(
            '/api/catalogo?ordenar=preco_menor',
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJsonPath('data.0.id', $livroBarato->id)
            ->assertJsonPath('data.1.id', $livroCaro->id);
    }

    public function test_catalogo_busca_livro_e_autor_ignorando_maiusculas_e_minusculas(): void
    {
        $auth = $this->loginComoComprador();
        $autor = Autor::factory()->create(['nome' => 'Robert Martin']);

        $livro = Livro::factory()->create([
            'autor_id' => $autor->id,
            'titulo' => 'Codigo Limpo',
            'descricao' => 'Boas Praticas de Desenvolvimento',
            'isbn' => 'ISBN-ABC-123',
        ]);

        Livro::factory()->create([
            'titulo' => 'Outro Livro',
            'descricao' => 'Outro assunto',
            'isbn' => 'ISBN-XYZ-999',
        ]);

        $this->getJson(
            '/api/catalogo?busca=codigo',
            $this->headerComToken($auth['token'])
        )
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $livro->id);

        $this->getJson(
            '/api/catalogo?busca=praticas',
            $this->headerComToken($auth['token'])
        )
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $livro->id);

        $this->getJson(
            '/api/catalogo?busca=isbn-abc',
            $this->headerComToken($auth['token'])
        )
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $livro->id);

        $this->getJson(
            '/api/catalogo?autor=robert',
            $this->headerComToken($auth['token'])
        )
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $livro->id);
    }

    public function test_pode_visualizar_livro_especifico(){
        $auth = $this->loginComoComprador();
        $livro = Livro::factory()->create();
        $response = $this->getJson(
            "/api/livros/{$livro->id}",
            $this->headerComToken($auth['token'])
        );
        $response->assertStatus(200)
                 ->assertJsonFragment(['id' => $livro->id]);
    }

    public function test_comprador_pode_visualizar_detalhes_do_livro_pelo_slug(): void
    {
        $auth = $this->loginComoComprador();
        $autor = Autor::factory()->create(['nome' => 'Robert Martin']);
        $categoria = Categoria::factory()->create([
            'nome' => 'Programação',
            'slug' => 'programacao',
        ]);
        $livro = Livro::factory()->create([
            'autor_id' => $autor->id,
            'categoria_id' => $categoria->id,
            'titulo' => 'Codigo Limpo',
            'slug' => 'codigo-limpo',
            'descricao' => 'Boas praticas de desenvolvimento',
            'isbn' => '978-85-00000-00-1',
            'numero_paginas' => 425,
            'imagem_capa' => 'https://example.com/codigo-limpo.png',
            'sobre' => 'Um guia para escrever software melhor.',
            'preco' => 89.90,
            'estoque' => 8,
        ]);

        $response = $this->getJson(
            '/api/catalogo/livros/codigo-limpo',
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJsonPath('id', $livro->id)
            ->assertJsonPath('titulo', 'Codigo Limpo')
            ->assertJsonPath('slug', 'codigo-limpo')
            ->assertJsonPath('descricao', 'Boas praticas de desenvolvimento')
            ->assertJsonPath('isbn', '978-85-00000-00-1')
            ->assertJsonPath('numero_paginas', 425)
            ->assertJsonPath('imagem_capa', 'https://example.com/codigo-limpo.png')
            ->assertJsonPath('sobre', 'Um guia para escrever software melhor.')
            ->assertJsonPath('autor.id', $autor->id)
            ->assertJsonPath('autor.nome', 'Robert Martin')
            ->assertJsonPath('categoria.id', $categoria->id)
            ->assertJsonPath('categoria.nome', 'Programação')
            ->assertJsonPath('estoque', 8);
    }

    public function test_admin_pode_criar_livro(){
        $auth = $this->loginComoAdmin();
        $autor = Autor::factory()->create();
        $categoria = Categoria::factory()->create();

        $response = $this->postJson(
            '/api/livros',
            $this->dadosLivro($autor->id, $categoria->id),
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(201)
                 ->assertJsonFragment(['titulo' => 'Introdução ao desenvolvimento web volume 2']);

        $this->assertDatabaseHas('livros', [
            'titulo' => 'Introdução ao desenvolvimento web volume 2',
        ]);
    }

    public function test_comprador_nao_pode_criar_livro(){
        $auth = $this->loginComoComprador();
        $autor = Autor::factory()->create();
        $categoria = Categoria::factory()->create();

        $response = $this->postJson(
            '/api/livros',
            $this->dadosLivro($autor->id, $categoria->id),
            $this->headerComToken($auth['token'])
        );
        $response->assertStatus(403);
    }

    // --- UPDATE ---

    public function test_admin_pode_atualizar_livro(): void
    {
        $auth  = $this->loginComoAdmin();
        $livro = Livro::factory()->create();

        $response = $this->putJson(
            "/api/livros/{$livro->id}",
            [
                'titulo'      => 'Título Atualizado',
                'autor_id'    => $livro->autor_id,
                'categoria_id' => $livro->categoria_id,
            ],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJsonFragment(['titulo' => 'Título Atualizado']);

        $this->assertDatabaseHas('livros', ['titulo' => 'Título Atualizado']);
    }

     public function test_comprador_nao_pode_atualizar_livro(): void
    {
        $auth  = $this->loginComoComprador();
        $livro = Livro::factory()->create();

        $response = $this->putJson(
            "/api/livros/{$livro->id}",
            ['titulo' => 'Título Atualizado'],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(403);
    }

    // --- DESTROY ---

    public function test_admin_pode_deletar_livro(): void
    {
        $auth  = $this->loginComoAdmin();
        $livro = Livro::factory()->create();

        $response = $this->deleteJson(
            "/api/livros/{$livro->id}",
            [],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(204);

        $this->assertDatabaseMissing('livros', ['id' => $livro->id]);
    }

    public function test_comprador_nao_pode_deletar_livro(): void
    {
        $auth  = $this->loginComoComprador();
        $livro = Livro::factory()->create();

        $response = $this->deleteJson(
            "/api/livros/{$livro->id}",
            [],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(403);
    }


}
