<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\PaymentGatewayException;
use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Services\PagamentoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PagamentoController extends Controller
{
    public function __construct(private PagamentoService $pagamentoService){}

    public function intencaoPagamento(Request $request): JsonResponse {
        Log::info("dados vindos do front : ". json_encode($request->all()));
        Log::info("caí no método de intenção de pagamento");
        $request->validate([
            //'livroIds' => 'required|array|min:1',
            'livroIds.*' => 'integer|exists:livros,id'
        ]);

        Log::info('Criando PaymentIntent', [
            'user_id' => $request->user()->id,
            'livro_ids' => $request->livroIds
        ]);

        try{
            $client_secret = $this->pagamentoService->processarPagamento($request->livros, $request->user()->id);
            Log::info("Client secret : ". $client_secret);
            return response()->json(['client_secret' => $client_secret]);
        }catch(PaymentGatewayException $e){
            Log::warning('Serviço de pagamento indisponível', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => $e->getMessage(),
                'code' => 'payment_gateway_unavailable',
            ], 503);
        }catch(\Exception $e){
            Log::error("Exceção com client secret : ". $e);

            return response()->json([
                'message' => 'Não foi possível concluir o pagamento. Tente novamente em alguns instantes.',
                'code' => 'payment_processing_failed',
            ], 500);
        }
    }

    public function confirmarPagamento(Request $request): JsonResponse
    {
        $dadosValidados = $request->validate([
            'payment_intent_id' => 'required|string',
            'nome_no_cartao' => 'nullable|string|max:120',
            'pais_cartao' => 'nullable|string|size:2',
        ]);

        Log::info('Confirmando pagamento com dados de cobranca', [
            'user_id' => $request->user()->id,
            'payment_intent_id' => $request->payment_intent_id,
            'nome_no_cartao_informado' => $request->filled('nome_no_cartao'),
            'pais_cartao' => $request->pais_cartao,
        ]);

        try {
            $resultado = $this->pagamentoService->confirmarPagamento(
                $request->payment_intent_id,
                $request->user()->id,
                [
                    'nome_no_cartao' => $dadosValidados['nome_no_cartao'] ?? null,
                    'pais_cartao' => $dadosValidados['pais_cartao'] ?? null,
                ]
            );

            $httpStatus = match ($resultado['status']) {
                Pedido::STATUS_PAGO => 200,
                Pedido::STATUS_FALHA => 422,
                default => 202,
            };

            return response()->json($resultado, $httpStatus);
        } catch (PaymentGatewayException $e) {
            Log::warning('Serviço de pagamento indisponível ao confirmar pagamento', [
                'user_id' => $request->user()->id,
                'payment_intent_id' => $request->payment_intent_id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => $e->getMessage(),
                'code' => 'payment_confirmation_unavailable',
            ], 503);
        } catch (\Exception $e) {
            Log::error('Erro ao confirmar pagamento: '. $e);

            return response()->json([
                'message' => 'Não foi possível confirmar o pagamento. Verifique seu histórico de pedidos antes de tentar pagar novamente.',
                'code' => 'payment_confirmation_failed',
            ], 500);
        }
    }
}
