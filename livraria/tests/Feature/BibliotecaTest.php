<?php

namespace Tests\Feature;

use App\Models\Livro;
use App\Models\Pedido;
use App\Models\PedidoItems;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class BibliotecaTest extends TestCase
{
    public function test_biblioteca_lista_apenas_ebooks_de_pedidos_pagos_do_comprador(): void
    {
        $auth = $this->loginComoComprador();
        $livroPago = Livro::factory()->create([
            'formato_ebook' => 'pdf',
            'arquivo_ebook' => 'ebooks/livro-pago.pdf',
        ]);
        $livroPendente = Livro::factory()->create();
        $livroDeOutroComprador = Livro::factory()->create();

        $this->criarPedidoComItem($auth['user'], $livroPago, Pedido::STATUS_PAGO);
        $this->criarPedidoComItem($auth['user'], $livroPendente, Pedido::STATUS_PENDENTE);

        $outroComprador = User::factory()->create();
        $outroComprador->assignRole('comprador');
        $this->criarPedidoComItem($outroComprador, $livroDeOutroComprador, Pedido::STATUS_PAGO);

        $this->getJson('/api/minha-biblioteca', $this->headerComToken($auth['token']))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $livroPago->id)
            ->assertJsonPath('data.0.formato_ebook', 'pdf')
            ->assertJsonPath('data.0.leitura_disponivel', true)
            ->assertJsonPath('data.0.endpoint_leitura', "/api/biblioteca/livros/{$livroPago->id}/leitura");
    }

    public function test_comprador_pode_ler_pdf_que_adquiriu(): void
    {
        Storage::fake('local');

        $auth = $this->loginComoComprador();
        $livro = Livro::factory()->create([
            'arquivo_ebook' => 'ebooks/codigo-limpo.pdf',
            'formato_ebook' => 'pdf',
        ]);
        Storage::disk('local')->put($livro->arquivo_ebook, '%PDF-1.4');
        $this->criarPedidoComItem($auth['user'], $livro, Pedido::STATUS_PAGO);

        $this->get("/api/biblioteca/livros/{$livro->id}/leitura", $this->headerComToken($auth['token']))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_comprador_nao_pode_ler_ebook_que_nao_adquiriu(): void
    {
        $auth = $this->loginComoComprador();
        $livro = Livro::factory()->create([
            'arquivo_ebook' => 'ebooks/restrito.pdf',
            'formato_ebook' => 'pdf',
        ]);

        $this->getJson("/api/biblioteca/livros/{$livro->id}/leitura", $this->headerComToken($auth['token']))
            ->assertForbidden()
            ->assertJsonPath('message', 'Você não possui acesso a este ebook.');
    }

    public function test_leitura_no_navegador_rejeita_ebooks_epub(): void
    {
        $auth = $this->loginComoComprador();
        $livro = Livro::factory()->create([
            'arquivo_ebook' => 'ebooks/ebook.epub',
            'formato_ebook' => 'epub',
        ]);
        $this->criarPedidoComItem($auth['user'], $livro, Pedido::STATUS_PAGO);

        $this->getJson("/api/biblioteca/livros/{$livro->id}/leitura", $this->headerComToken($auth['token']))
            ->assertStatus(422)
            ->assertJsonPath(
                'message',
                'A leitura no navegador está disponível apenas para ebooks em PDF.'
            );
    }

    private function criarPedidoComItem(User $user, Livro $livro, string $status): Pedido
    {
        $pedido = Pedido::create([
            'user_id' => $user->id,
            'total' => 49.90,
            'stripe_payment_id' => "pi_teste_{$user->id}_{$livro->id}",
            'status' => $status,
        ]);

        PedidoItems::create([
            'pedido_id' => $pedido->id,
            'livro_id' => $livro->id,
            'quantidade' => 1,
            'preco' => 49.90,
        ]);

        return $pedido;
    }
}
