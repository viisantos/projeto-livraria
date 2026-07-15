<?php

namespace Tests\Feature;

use App\Exceptions\PaymentGatewayException;
use App\Models\Pedido;
use App\Services\PagamentoService;
use Mockery;

class PagamentoTest extends TestCase
{
    public function test_retorna_erro_amigavel_quando_gateway_de_pagamento_falha(): void
    {
        $auth = $this->loginComoComprador();
        $mensagem = 'Não foi possível iniciar o pagamento no momento. Tente novamente em alguns instantes.';

        $pagamentoService = Mockery::mock(PagamentoService::class);
        $pagamentoService->shouldReceive('processarPagamento')
            ->once()
            ->andThrow(new PaymentGatewayException($mensagem));

        $this->app->instance(PagamentoService::class, $pagamentoService);

        $response = $this->postJson(
            '/api/payment/intent',
            [
                'livros' => [
                    [
                        'livroId' => 1,
                        'price' => 59.9,
                    ],
                ],
            ],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(503)
            ->assertJson([
                'message' => $mensagem,
                'code' => 'payment_gateway_unavailable',
            ]);
    }

    public function test_confirma_pagamento_com_sucesso(): void
    {
        $auth = $this->loginComoComprador();

        $pagamentoService = Mockery::mock(PagamentoService::class);
        $pagamentoService->shouldReceive('confirmarPagamento')
            ->once()
            ->with('pi_teste_123', $auth['user']->id, [
                'nome_no_cartao' => null,
                'pais_cartao' => null,
            ])
            ->andReturn([
                'status' => Pedido::STATUS_PAGO,
                'message' => 'Pagamento confirmado com sucesso.',
            ]);

        $this->app->instance(PagamentoService::class, $pagamentoService);

        $response = $this->postJson(
            '/api/payment/confirm',
            ['payment_intent_id' => 'pi_teste_123'],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJson([
                'status' => Pedido::STATUS_PAGO,
                'message' => 'Pagamento confirmado com sucesso.',
            ]);
    }

    public function test_confirma_pagamento_com_dados_de_cobranca(): void
    {
        $auth = $this->loginComoComprador();

        $pagamentoService = Mockery::mock(PagamentoService::class);
        $pagamentoService->shouldReceive('confirmarPagamento')
            ->once()
            ->with('pi_teste_123', $auth['user']->id, [
                'nome_no_cartao' => 'Cliente Teste',
                'pais_cartao' => 'BR',
            ])
            ->andReturn([
                'status' => Pedido::STATUS_PAGO,
                'message' => 'Pagamento confirmado com sucesso.',
            ]);

        $this->app->instance(PagamentoService::class, $pagamentoService);

        $response = $this->postJson(
            '/api/payment/confirm',
            [
                'payment_intent_id' => 'pi_teste_123',
                'nome_no_cartao' => 'Cliente Teste',
                'pais_cartao' => 'BR',
            ],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
            ->assertJson([
                'status' => Pedido::STATUS_PAGO,
                'message' => 'Pagamento confirmado com sucesso.',
            ]);
    }

    public function test_retorna_erro_amigavel_quando_confirmacao_do_pagamento_falha(): void
    {
        $auth = $this->loginComoComprador();
        $mensagem = 'Não foi possível confirmar o pagamento no momento. Verifique seu histórico de pedidos antes de tentar pagar novamente.';

        $pagamentoService = Mockery::mock(PagamentoService::class);
        $pagamentoService->shouldReceive('confirmarPagamento')
            ->once()
            ->with('pi_teste_123', $auth['user']->id, [
                'nome_no_cartao' => null,
                'pais_cartao' => null,
            ])
            ->andThrow(new PaymentGatewayException($mensagem));

        $this->app->instance(PagamentoService::class, $pagamentoService);

        $response = $this->postJson(
            '/api/payment/confirm',
            ['payment_intent_id' => 'pi_teste_123'],
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(503)
            ->assertJson([
                'message' => $mensagem,
                'code' => 'payment_confirmation_unavailable',
            ]);
    }
}
