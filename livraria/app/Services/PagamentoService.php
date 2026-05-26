<?php
namespace App\Services;
use App\Exceptions\PaymentGatewayException;
use App\Repositories\Contracts\PedidoRepositoryInterface;
use App\Models\Livro;
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
}
