<?php
namespace App\Services;
use App\Exceptions\PaymentGatewayException;
use App\Models\Pedido;
use App\Repositories\Contracts\PedidoRepositoryInterface;
use App\Models\Livro;
use Illuminate\Support\Facades\DB;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\ApiErrorException;
use Illuminate\Support\Facades\Log;

class PagamentoService{
    public function __construct(private PedidoRepositoryInterface $pedidoRepository){
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function processarPagamento(array $livros, int $userId) {
        Log::info("entrei em processar pagamento ");
        Log::info("Objeto livros recebido : ". json_encode($livros));

        //$livros = Livro::whereIn('id', $livros_ids)->get();

        //if($livros->isEmpty()){
        //    throw new \Exception("Nenhum livro válido selecionado");
        //}

        //$total = $livros->sum('preco');

        $total = collect($livros)->sum(function($item){
            return $item['price'] * $item['quantidade'];
        });

        try {
            $intent = PaymentIntent::create([
                'amount' => (int)($total * 100),
                'currency' => 'brl',
                'metadata' => [
                    'user_id' => $userId,
                    'books' => implode(',', array_column($livros, 'livroId'))
                ]
            ], [
                'idempotency_key' => uniqid($userId. '_')
            ]);
        } catch (ApiErrorException $e) {
            Log::error('Falha ao criar PaymentIntent no Stripe', [
                'user_id' => $userId,
                'stripe_error' => $e->getMessage(),
                'stripe_code' => $e->getStripeCode(),
            ]);

            throw new PaymentGatewayException(
                'Não foi possível iniciar o pagamento no momento. Tente novamente em alguns instantes.',
                previous: $e
            );
        }

        Log::info("intenção de pagamento criada : ". $intent);

        $pedidoItems = collect($livros)->map(function($livro){
            return [
                'livro_id'       => $livro['livroId'],
                'quantidade'     => $livro['quantidade'],
                'preco'          => $livro['price']
            ];
        })->toArray();

        $this->pedidoRepository->createPedidoWithItems(
            $userId,
            $total,
            $intent->id,
            $pedidoItems
        );

        return $intent->client_secret;
    }

    public function confirmarPagamento(string $paymentIntentId, int $userId): array
    {
        try {
            $intent = PaymentIntent::retrieve($paymentIntentId);
        } catch (ApiErrorException $e){
            Log::error('Falha ao consultar PaymentIntent no Stripe', [
                'user_id' => $userId,
                'payment_intent_id' => $paymentIntentId,
                'stripe_error' => $e->getMessage(),
                'stripe_code' => $e->getStripeCode(),
            ]);

            throw new PaymentGatewayException(
                'Não foi possível confirmar o pagamento no momento. Verifique seu histórico de pedidos antes de tentar pagar novamente.',
                previous: $e
            );
        }

        $pedido = $this->pedidoRepository->findByStripeId($paymentIntentId);

        if (!$pedido || $pedido->user_id !== $userId) {
            throw new \Exception('Pedido não encontrado para este pagamento.');
        }

        if ($intent->status === 'succeeded') {
            $this->registrarPagamentoAprovado($paymentIntentId);

            return [
                'status' => Pedido::STATUS_PAGO,
                'message' => 'Pagamento confirmado com sucesso.',
            ];
        }

        if (in_array($intent->status, ['requires_payment_method', 'canceled'], true)) {
            $this->pedidoRepository->updateStatusByStripeId($paymentIntentId, Pedido::STATUS_FALHA);

            return [
                'status' => Pedido::STATUS_FALHA,
                'message' => 'O pagamento não foi concluído. Confira os dados do cartão e tente novamente.',
            ];
        }

        return [
            'status' => Pedido::STATUS_PENDENTE,
            'message' => 'O pagamento ainda está sendo processado. Aguarde alguns instantes e confira seu histórico de pedidos.',
        ];
    }

    public function registrarPagamentoAprovado(string $paymentIntentId): void
    {
        DB::transaction(function () use ($paymentIntentId) {
            $pedido = Pedido::with('itens.livro')
                ->where('stripe_payment_id', '=', $paymentIntentId)
                ->lockForUpdate()
                ->first();

            if (!$pedido) {
                throw new \Exception('Pedido não encontrado');
            }

            if ($pedido->status === Pedido::STATUS_PAGO) {
                return;
            }

            if ($pedido->status !== Pedido::STATUS_PENDENTE) {
                throw new \Exception('Pedido não está pendente');
            }

            foreach($pedido->itens as $item){
                $livro = $item->livro;
                if($livro->estoque < $item->quantidade){
                    throw new \Exception("Estoque insuficiente para o livro: ". $livro->titulo);
                }
                $livro->decrement('estoque', $item->quantidade);
            }

            $pedido->status = Pedido::STATUS_PAGO;
            $pedido->save();
        });
    }
}
