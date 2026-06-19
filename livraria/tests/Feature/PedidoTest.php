<?php

namespace Tests\Feature;

use App\Models\Livro;
use App\Models\Pedido;
use App\Models\PedidoItems;
use App\Models\User;

class PedidoTest extends TestCase
{
    public function test_comprador_pode_visualizar_detalhes_do_proprio_pedido(): void
    {
        $auth = $this->loginComoComprador();
        $livro = Livro::factory()->create([
            'titulo' => 'Codigo Limpo',
            'imagem_capa' => 'https://example.com/codigo-limpo.png',
        ]);

        $pedido = Pedido::create([
            'user_id' => $auth['user']->id,
            'total' => 179.80,
            'stripe_payment_id' => 'pi_teste_123',
            'status' => Pedido::STATUS_PAGO,
        ]);

        PedidoItems::create([
            'pedido_id' => $pedido->id,
            'livro_id' => $livro->id,
            'quantidade' => 2,
            'preco' => 89.90,
        ]);

        $response = $this->getJson(
            "/api/pedidos/{$pedido->id}",
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJsonPath('id', $pedido->id)
            ->assertJsonPath('status', Pedido::STATUS_PAGO)
            ->assertJsonPath('itens.0.livro_id', $livro->id)
            ->assertJsonPath('itens.0.titulo', 'Codigo Limpo')
            ->assertJsonPath('itens.0.imagem_capa', 'https://example.com/codigo-limpo.png')
            ->assertJsonPath('itens.0.quantidade', 2);
    }

    public function test_comprador_nao_pode_visualizar_pedido_de_outro_usuario(): void
    {
        $auth = $this->loginComoComprador();
        $outroUsuario = User::factory()->create();
        $outroUsuario->assignRole('comprador');

        $pedido = Pedido::create([
            'user_id' => $outroUsuario->id,
            'total' => 59.90,
            'stripe_payment_id' => 'pi_outro_usuario',
            'status' => Pedido::STATUS_PENDENTE,
        ]);

        $this->getJson(
            "/api/pedidos/{$pedido->id}",
            $this->headerComToken($auth['token'])
        )->assertStatus(403);
    }

    public function test_detalhe_do_pedido_exige_autenticacao(): void
    {
        $usuario = User::factory()->create();
        $usuario->assignRole('comprador');

        $pedido = Pedido::create([
            'user_id' => $usuario->id,
            'total' => 59.90,
            'stripe_payment_id' => 'pi_teste_sem_auth',
            'status' => Pedido::STATUS_PENDENTE,
        ]);

        $this->getJson("/api/pedidos/{$pedido->id}")
            ->assertStatus(401);
    }
}
