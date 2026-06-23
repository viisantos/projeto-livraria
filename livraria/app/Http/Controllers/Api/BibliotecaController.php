<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BibliotecaLivroResource;
use App\Models\Livro;
use App\Models\Pedido;
use App\Models\PedidoItems;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BibliotecaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $livros = Livro::query()
            ->with(['autor', 'categoria'])
            ->whereHas('pedidoItems.pedido', function (Builder $query) use ($userId) {
                $query->where('user_id', $userId)
                    ->where('status', Pedido::STATUS_PAGO);
            })
            ->withMin(['pedidoItems as adquirido_em' => function (Builder $query) use ($userId) {
                $query->whereHas('pedido', function (Builder $pedidoQuery) use ($userId) {
                    $pedidoQuery->where('user_id', $userId)
                        ->where('status', Pedido::STATUS_PAGO);
                });
            }], 'created_at')
            ->orderByDesc('adquirido_em')
            ->get();

        return BibliotecaLivroResource::collection($livros)->response();
    }

    public function leitura(Request $request, Livro $livro): BinaryFileResponse|JsonResponse
    {
        if (!$this->usuarioPossuiLivro($request->user()->id, $livro)) {
            return response()->json([
                'message' => 'Você não possui acesso a este ebook.',
            ], 403);
        }

        if ($livro->formato_ebook !== 'pdf') {
            return response()->json([
                'message' => 'A leitura no navegador está disponível apenas para ebooks em PDF.',
            ], 422);
        }

        if (!$livro->arquivo_ebook || !Storage::disk('local')->exists($livro->arquivo_ebook)) {
            return response()->json([
                'message' => 'O arquivo deste ebook não está disponível no momento.',
            ], 404);
        }

        return response()->file(
            Storage::disk('local')->path($livro->arquivo_ebook),
            ['Content-Type' => 'application/pdf'],
            'inline'
        );
    }

    private function usuarioPossuiLivro(int $userId, Livro $livro): bool
    {
        return PedidoItems::query()
            ->where('livro_id', $livro->id)
            ->whereHas('pedido', function (Builder $query) use ($userId) {
                $query->where('user_id', $userId)
                    ->where('status', Pedido::STATUS_PAGO);
            })
            ->exists();
    }
}
