<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LivroCollection;
use App\Http\Resources\LivroResource;
use App\Models\Livro;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoritoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 12);
        $perPage = max(1, min($perPage, 50));

        $favoritos = $request->user()
            ->favoritos()
            ->with(['autor', 'categoria'])
            ->orderByDesc('livro_user.created_at')
            ->paginate($perPage);

        return response()->json(new LivroCollection($favoritos));
    }

    public function store(Request $request, Livro $livro): JsonResponse
    {
        $request->user()->favoritos()->syncWithoutDetaching([$livro->id]);

        return response()->json([
            'message' => 'Livro adicionado aos favoritos.',
            'favorito' => true,
            'livro' => new LivroResource($livro->load(['autor', 'categoria'])),
        ], 201);
    }

    public function destroy(Request $request, Livro $livro): JsonResponse
    {
        $request->user()->favoritos()->detach($livro->id);

        return response()->json([
            'message' => 'Livro removido dos favoritos.',
            'favorito' => false,
        ]);
    }

    public function show(Request $request, Livro $livro): JsonResponse
    {
        $favorito = $request->user()
            ->favoritos()
            ->where('livros.id', $livro->id)
            ->exists();

        return response()->json([
            'livro_id' => $livro->id,
            'favorito' => $favorito,
        ]);
    }
}
