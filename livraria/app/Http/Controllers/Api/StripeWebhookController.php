<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Repositories\Contracts\PedidoRepositoryInterface;
use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Service\WebhookEndpointService;
use Stripe\Webhook;

class StripeWebhookController extends Controller{
    public function __construct(private PedidoRepositoryInterface $pedidoRepository){}

    public function handle(Request $request){
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try{
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (SignatureVerificationException $e){
            Log::warning('Webhook do Stripe com assinatura inválida');
            return response()->json(['message' => 'Assinatura inválida'], 400);
        }

        match($event->type){
            'payment_intent.succeeded' => $this->handlePaymentSucceeded($event->data->object),
            'payment_intent.payment_failed' => $this->handlePaymentFailed($event->data->object),
            default => Log::info("Evento Stripe ignorado: ". $event->type)
        };

        return response()->json(['status' => 'ok']);
    }

    private function handlePaymentSucceeded(object $paymentIntent){
        $pedido = Pedido::with('itens.livro')
                    ->where('stripe_payment_id', '=', $paymentIntent->id)
                    ->first();

            if (!$pedido) {
                Log::error("Pedido não encontrado para Stripe Intent ID: ". $paymentIntent->id);
                return;
            }
            else if($pedido->status === 'pago'){
                Log::info("Pedido já marcado como pago para Stripe Intent ID: ". $paymentIntent->id);
                return;
            }

        DB::transaction(function() use ($pedido) {
            foreach($pedido->itens as $item){
                $livro = $item->livro;
                if($livro->estoque < $item->quantidade){
                    throw new \Exception("Estoque insuficiente para o livro: ". $livro->titulo);
                }
                $livro->decrement('estoque', $item->quantidade);
            }
        });

        $this->pedidoRepository->updateStatusByStripeId($paymentIntent->id, 'pago');
        Log::info("Pagamento bem-sucedido para Stripe Intent ID: ". $paymentIntent->id);
    }

    private function handlePaymentFailed(object $paymentIntent){
        $this->pedidoRepository->updateStatusByStripeId($paymentIntent->id, 'falha');
        Log::warning("Pagamento falho para Stripe Intent ID: ". $paymentIntent->id);
    }

}
