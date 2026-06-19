<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class historicoPedidos extends Controller
{
    public function historico_pedidos(Request $request): JsonResponse {
        $userId = $request->user()->id;
        $pedidos = Pedido::with('itens.livro')
                   ->where('user_id', $userId)->orderBy('id', 'desc')
                   ->get();
        return response()->json(
            $pedidos->map(fn ($pedido) => $this->formatarPedido($pedido))
        );
    }

    public function show(Request $request, Pedido $pedido): JsonResponse
    {
        if ($pedido->user_id !== $request->user()->id) {
            abort(403, 'Você não tem permissão para visualizar este pedido.');
        }

        $pedido->load('itens.livro');

        return response()->json($this->formatarPedido($pedido));
    }

    private function formatarPedido(Pedido $pedido): array
    {
        return [
            'id'          => $pedido->id,
            'status'      => $pedido->status,
            'total'       => $pedido->total,
            'created_at'  => $pedido->created_at,

            'itens'       => $pedido->itens->map(function($item){
                return[
                    'livro_id'       => $item->livro_id,
                    'titulo'         => $item->livro->titulo,
                    'imagem_capa'    => $item->livro->imagem_capa,
                    'quantidade'     => $item->quantidade,
                    'preco_unitario' => $item->preco,
                    'subtotal'       => $item->quantidade * $item->preco,
                ];
            })
        ];
    }
}
