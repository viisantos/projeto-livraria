<?php

namespace Tests\Feature;

use App\Exceptions\PaymentGatewayException;
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
                        'quantidade' => 1,
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
}
