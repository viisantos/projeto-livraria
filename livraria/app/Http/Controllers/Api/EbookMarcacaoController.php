<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EbookMarcacao;
use App\Models\Livro;
use App\Models\Pedido;
use App\Models\PedidoItems;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EbookMarcacaoController extends Controller
{
    public function index(Request $request, Livro $livro): JsonResponse
    {
        if (!$this->usuarioPossuiLivro($request->user()->id, $livro)) {
            return response()->json([
                'message' => 'Você não possui acesso a este ebook.',
            ], 403);
        }

        $marcacoes = EbookMarcacao::query()
            ->where('user_id', $request->user()->id)
            ->where('livro_id', $livro->id)
            ->orderBy('pagina')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => $marcacoes,
        ]);
    }

    public function store(Request $request, Livro $livro): JsonResponse
    {
        if (!$this->usuarioPossuiLivro($request->user()->id, $livro)) {
            return response()->json([
                'message' => 'Você não possui acesso a este ebook.',
            ], 403);
        }

        $dados = $request->validate([
            'tipo' => ['required', Rule::in([
                EbookMarcacao::TIPO_MARCADOR,
                EbookMarcacao::TIPO_DESTAQUE,
                EbookMarcacao::TIPO_ANOTACAO,
            ])],
            'pagina' => ['required', 'integer', 'min:1'],
            'texto' => ['nullable', 'string', 'max:5000'],
            'cor' => ['nullable', 'string', 'max:20'],
            'retangulos' => ['nullable', 'array'],
            'retangulos.*.left' => ['required_with:retangulos', 'numeric', 'min:0'],
            'retangulos.*.top' => ['required_with:retangulos', 'numeric', 'min:0'],
            'retangulos.*.width' => ['required_with:retangulos', 'numeric', 'min:0'],
            'retangulos.*.height' => ['required_with:retangulos', 'numeric', 'min:0'],
        ]);

        if ($dados['tipo'] !== EbookMarcacao::TIPO_MARCADOR && blank($dados['texto'] ?? null)) {
            return response()->json([
                'message' => 'O texto é obrigatório para anotações e destaques.',
                'errors' => [
                    'texto' => ['O texto é obrigatório para anotações e destaques.'],
                ],
            ], 422);
        }

        $marcacao = EbookMarcacao::query()->create([
            ...$dados,
            'user_id' => $request->user()->id,
            'livro_id' => $livro->id,
        ]);

        return response()->json([
            'message' => 'Marcação salva com sucesso.',
            'data' => $marcacao,
        ], 201);
    }

    public function destroy(Request $request, EbookMarcacao $marcacao): JsonResponse
    {
        if ($marcacao->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Você não pode remover esta marcação.',
            ], 403);
        }

        $marcacao->delete();

        return response()->json([
            'message' => 'Marcação removida com sucesso.',
        ]);
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
