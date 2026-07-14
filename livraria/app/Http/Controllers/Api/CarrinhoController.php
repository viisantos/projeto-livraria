<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LivroResource;
use App\Models\Livro;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class CarrinhoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return $this->responderCarrinho($request);
    }

    public function store(Request $request, Livro $livro): JsonResponse
    {
        $request->user()->carrinho()->syncWithoutDetaching([$livro->id]);

        return $this->responderCarrinho($request, 201);
    }

    public function destroy(Request $request, Livro $livro): JsonResponse
    {
        $request->user()->carrinho()->detach($livro->id);

        return $this->responderCarrinho($request);
    }

    public function clear(Request $request): JsonResponse
    {
        $request->user()->carrinho()->detach();

        return $this->responderCarrinho($request);
    }

    public function sync(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'livro_ids' => 'sometimes|array',
            'livro_ids.*' => 'integer|exists:livros,id',
            'livros' => 'sometimes|array',
            'livros.*.livroId' => 'required_with:livros|integer|exists:livros,id',
        ]);

        $livroIds = collect($dados['livro_ids'] ?? [])
            ->merge(collect($dados['livros'] ?? [])->pluck('livroId'))
            ->merge($request->user()->carrinho()->pluck('livros.id'))
            ->unique()
            ->values()
            ->all();

        $request->user()->carrinho()->sync($livroIds);

        return $this->responderCarrinho($request);
    }

    private function responderCarrinho(Request $request, int $status = 200): JsonResponse
    {
        $livros = $request->user()
            ->carrinho()
            ->with(['autor', 'categoria'])
            ->orderBy('carrinho_itens.created_at')
            ->get();

        return response()->json([
            'data' => LivroResource::collection($livros),
            'total_itens' => $livros->count(),
            'subtotal' => $this->subtotal($livros),
        ], $status);
    }

    private function subtotal(Collection $livros): float
    {
        return (float) $livros->sum(fn (Livro $livro) => (float) $livro->preco);
    }
}
