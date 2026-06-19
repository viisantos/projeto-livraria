<?php
namespace App\Repositories;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\PedidoItems;
use App\Repositories\Contracts\PedidoRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PedidoRepository implements PedidoRepositoryInterface{
    public function createPedidoWithItems(int $userId, float $total, string $stripeIntentId, array $items): ?Pedido {
            try {
                $pedidoExistente = Pedido::where('user_id', '=', $userId)
                    ->where('status', '=', Pedido::STATUS_PENDENTE)
                    ->where('stripe_payment_id', '=', $stripeIntentId)
                    ->latest()
                    ->first();
                if ($pedidoExistente) {
                    Log::info("Pedido existente encontrado : ". $pedidoExistente);
                    return $pedidoExistente->stripe_payment_id;
                }else{
                    return DB::transaction(function () use ($items, $userId, $total, $stripeIntentId) {
                    $pedido = new Pedido();
                    $pedido->user_id = $userId;
                    $pedido->total = $total;
                    $pedido->stripe_payment_id = $stripeIntentId;
                    $pedido->status = Pedido::STATUS_PENDENTE;
                    $pedido->save();
                    foreach ($items as $item) {
                        $pedidoItem = new PedidoItems();
                        $pedidoItem->pedido_id  = $pedido->id;
                        $pedidoItem->livro_id   = $item['livro_id'];
                        $pedidoItem->quantidade = $item['quantidade'];
                        $pedidoItem->preco      = $item['preco'];
                        $pedidoItem->save();
                    }
                    Log::info("Itens do pedido : ". $pedido->itens()->get());
                    return $pedido;
                });
            }
        } catch (\Exception $e) {
            Log::info("Exceção de criação de pedido : ". $e);
            throw $e;
        }

            /*Log::info(json_encode($pedido->itens()->get()));
            Log::info("Itens");
            Log::info($items);
            Log::info("Pedido : ". $pedido);
            Log::info("tabela usada pelo objeto pedido : ". $pedido->getTable());*/
    }

    public function updateStatusByStripeId(string $stripeIntentId, string $status): void {
        try {
            DB::transaction(function () use ($stripeIntentId, $status) {
                $pedido = Pedido::where('status', '=', Pedido::STATUS_PENDENTE)
                        ->where('stripe_payment_id','=', $stripeIntentId)
                        ->first();
                if (!$pedido) {
                    throw new \Exception('Pedido não encontrado');
                }
                $pedido->status = $status;
                $pedido->save();
            });
         } catch (\Exception $e) {
            Log::info("Exceção de atualização de pedido : ". $e);
            throw $e;
        }
        //Log::info("pedido que foi atualizado : ". Pedido::where('status', '=', Pedido::STATUS_PENDENTE)
        //      ->where('stripe_payment_id','=', $stripeIntentId)->first());

        /*Pedido::where('status', '=', Pedido::STATUS_PENDENTE)
              ->where('stripe_payment_id','=', $stripeIntentId)
              ->update(['status' => $status]);*/
    }

    public function findByStripeId(string $stripePaymentId): ?Pedido {
        return Pedido::where('stripe_payment_id','=', $stripePaymentId)->with(['itens.livro','user'])->first();
    }
}
