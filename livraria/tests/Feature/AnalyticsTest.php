<?php

namespace Tests\Feature;

use App\Models\Livro;
use App\Models\Pedido;
use App\Models\PedidoItems;

class AnalyticsTest extends TestCase
{
    public function test_admin_pode_visualizar_dashboard_de_analytics(): void
    {
        $auth = $this->loginComoAdmin();
        $livro = Livro::factory()->create(['preco' => 50]);

        $pedido = Pedido::create([
            'user_id' => $auth['user']->id,
            'total' => 50,
            'stripe_payment_id' => 'pi_analytics_teste',
            'status' => Pedido::STATUS_PAGO,
        ]);

        PedidoItems::create([
            'pedido_id' => $pedido->id,
            'livro_id' => $livro->id,
            'preco' => 50,
        ]);

        $response = $this->getJson('/api/admin/analytics', $this->headerComToken($auth['token']));

        $response->assertStatus(200)
            ->assertJsonPath('kpis.receita.valor', 50)
            ->assertJsonStructure([
                'periodo',
                'kpis' => ['receita', 'pedidos_pagos', 'ticket_medio', 'itens_vendidos'],
                'series' => ['vendas_por_periodo', 'status_pedidos', 'receita_por_categoria'],
                'rankings' => ['livros_mais_vendidos', 'clientes_mais_valiosos'],
                'pedidos_recentes',
                'exportacoes',
            ]);
    }

    public function test_comprador_nao_pode_visualizar_dashboard_de_analytics(): void
    {
        $auth = $this->loginComoComprador();

        $this->getJson('/api/admin/analytics', $this->headerComToken($auth['token']))
            ->assertStatus(403);
    }

    public function test_admin_pode_exportar_pedidos_em_csv(): void
    {
        $auth = $this->loginComoAdmin();

        $response = $this->get('/api/admin/analytics/exportar/pedidos', $this->headerComToken($auth['token']));

        $response->assertStatus(200)
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_admin_pode_exportar_itens_em_csv(): void
    {
        $auth = $this->loginComoAdmin();

        $response = $this->get('/api/admin/analytics/exportar/itens', $this->headerComToken($auth['token']));

        $response->assertStatus(200)
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }
}
