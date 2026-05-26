<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Pedido;
use Illuminate\Http\Request;

class historicoPedidos extends Controller
{
    public function historico_pedidos(Request $request) {
        $userId = $request->user()->id;
        $pedidos = Pedido::with('itens.livro')
                   ->where('user_id', $userId)->orderBy('id', 'desc')
                   ->get();
        return response()->json(
            $pedidos->map(function ($pedido) {
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
            })
        );
    }
}
