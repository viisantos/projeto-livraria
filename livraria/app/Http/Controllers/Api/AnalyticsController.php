<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AnalyticsController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        [$inicio, $fim] = $this->periodo($request);
        [$inicioAnterior, $fimAnterior] = $this->periodoAnterior($inicio, $fim);

        $resumoAtual = $this->resumo($inicio, $fim);
        $resumoAnterior = $this->resumo($inicioAnterior, $fimAnterior);

        return response()->json([
            'periodo' => [
                'inicio' => $inicio->toDateString(),
                'fim' => $fim->toDateString(),
                'granularidade' => $this->granularidade($inicio, $fim),
            ],
            'comparativo' => [
                'inicio' => $inicioAnterior->toDateString(),
                'fim' => $fimAnterior->toDateString(),
            ],
            'kpis' => $this->kpis($resumoAtual, $resumoAnterior),
            'series' => [
                'vendas_por_periodo' => $this->vendasPorPeriodo($inicio, $fim),
                'status_pedidos' => $this->statusPedidos($inicio, $fim),
                'receita_por_categoria' => $this->receitaPorCategoria($inicio, $fim),
            ],
            'rankings' => [
                'livros_mais_vendidos' => $this->livrosMaisVendidos($inicio, $fim),
                'clientes_mais_valiosos' => $this->clientesMaisValiosos($inicio, $fim),
            ],
            'pedidos_recentes' => $this->pedidosRecentes($inicio, $fim),
            'exportacoes' => [
                'pedidos_csv' => url('/api/admin/analytics/exportar/pedidos?'.$request->getQueryString()),
                'itens_csv' => url('/api/admin/analytics/exportar/itens?'.$request->getQueryString()),
            ],
        ]);
    }

    public function exportarPedidos(Request $request): StreamedResponse
    {
        [$inicio, $fim] = $this->periodo($request);
        $nomeArquivo = "analytics-pedidos-{$inicio->toDateString()}-{$fim->toDateString()}.csv";

        return response()->streamDownload(function () use ($inicio, $fim) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($handle, ['pedido_id', 'data', 'cliente_id', 'cliente_nome', 'cliente_email', 'status', 'total', 'itens']);

            Pedido::with(['user', 'itens'])
                ->whereBetween('created_at', [$inicio, $fim])
                ->orderBy('created_at')
                ->chunk(500, function ($pedidos) use ($handle) {
                    foreach ($pedidos as $pedido) {
                        fputcsv($handle, [
                            $pedido->id,
                            $pedido->created_at?->format('Y-m-d H:i:s'),
                            $pedido->user_id,
                            $pedido->user?->name,
                            $pedido->user?->email,
                            $pedido->status,
                            number_format((float) $pedido->total, 2, '.', ''),
                            $pedido->itens->count(),
                        ]);
                    }
                });

            fclose($handle);
        }, $nomeArquivo, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function exportarItens(Request $request): StreamedResponse
    {
        [$inicio, $fim] = $this->periodo($request);
        $nomeArquivo = "analytics-itens-{$inicio->toDateString()}-{$fim->toDateString()}.csv";

        return response()->streamDownload(function () use ($inicio, $fim) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($handle, [
                'pedido_id',
                'data',
                'status',
                'cliente_id',
                'cliente_email',
                'livro_id',
                'livro_titulo',
                'categoria',
                'autor',
                'preco',
            ]);

            DB::table('pedido_items')
                ->join('pedidos', 'pedidos.id', '=', 'pedido_items.pedido_id')
                ->join('users', 'users.id', '=', 'pedidos.user_id')
                ->join('livros', 'livros.id', '=', 'pedido_items.livro_id')
                ->leftJoin('categorias', 'categorias.id', '=', 'livros.categoria_id')
                ->leftJoin('autores', 'autores.id', '=', 'livros.autor_id')
                ->whereBetween('pedidos.created_at', [$inicio, $fim])
                ->orderBy('pedidos.created_at')
                ->select([
                    'pedidos.id as pedido_id',
                    'pedidos.created_at as data',
                    'pedidos.status',
                    'pedidos.user_id as cliente_id',
                    'users.email as cliente_email',
                    'livros.id as livro_id',
                    'livros.titulo as livro_titulo',
                    'categorias.nome as categoria',
                    'autores.nome as autor',
                    'pedido_items.preco',
                ])
                ->chunk(1000, function ($itens) use ($handle) {
                    foreach ($itens as $item) {
                        fputcsv($handle, [
                            $item->pedido_id,
                            Carbon::parse($item->data)->format('Y-m-d H:i:s'),
                            $item->status,
                            $item->cliente_id,
                            $item->cliente_email,
                            $item->livro_id,
                            $item->livro_titulo,
                            $item->categoria,
                            $item->autor,
                            number_format((float) $item->preco, 2, '.', ''),
                        ]);
                    }
                });

            fclose($handle);
        }, $nomeArquivo, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function periodo(Request $request): array
    {
        $dados = $request->validate([
            'inicio' => 'nullable|date',
            'fim' => 'nullable|date|after_or_equal:inicio',
        ]);

        $inicio = isset($dados['inicio'])
            ? Carbon::parse($dados['inicio'])->startOfDay()
            : now()->subDays(89)->startOfDay();

        $fim = isset($dados['fim'])
            ? Carbon::parse($dados['fim'])->endOfDay()
            : now()->endOfDay();

        return [$inicio, $fim];
    }

    private function periodoAnterior(Carbon $inicio, Carbon $fim): array
    {
        $dias = $inicio->diffInDays($fim) + 1;
        $fimAnterior = $inicio->copy()->subSecond();
        $inicioAnterior = $fimAnterior->copy()->subDays($dias - 1)->startOfDay();

        return [$inicioAnterior, $fimAnterior];
    }

    private function resumo(Carbon $inicio, Carbon $fim): array
    {
        $pedidos = Pedido::with('itens')
            ->whereBetween('created_at', [$inicio, $fim])
            ->get();

        $pagos = $pedidos->where('status', Pedido::STATUS_PAGO);
        $clientesPagantes = $pagos->pluck('user_id')->unique()->count();
        $clientesRecorrentes = $pagos->groupBy('user_id')->filter(fn ($pedidos) => $pedidos->count() > 1)->count();

        return [
            'receita' => (float) $pagos->sum('total'),
            'pedidos_pagos' => $pagos->count(),
            'pedidos_total' => $pedidos->count(),
            'itens_vendidos' => $pagos->sum(fn (Pedido $pedido) => $pedido->itens->count()),
            'clientes_pagantes' => $clientesPagantes,
            'clientes_recorrentes' => $clientesRecorrentes,
            'ticket_medio' => $pagos->count() > 0 ? (float) $pagos->avg('total') : 0.0,
            'taxa_recompra' => $clientesPagantes > 0 ? round(($clientesRecorrentes / $clientesPagantes) * 100, 2) : 0.0,
            'pedidos_pendentes' => $pedidos->where('status', Pedido::STATUS_PENDENTE)->count(),
            'pedidos_falha' => $pedidos->where('status', Pedido::STATUS_FALHA)->count(),
        ];
    }

    private function kpis(array $atual, array $anterior): array
    {
        return [
            'receita' => $this->kpi('Receita', $atual['receita'], $anterior['receita'], 'currency'),
            'pedidos_pagos' => $this->kpi('Pedidos pagos', $atual['pedidos_pagos'], $anterior['pedidos_pagos'], 'number'),
            'ticket_medio' => $this->kpi('Ticket médio', $atual['ticket_medio'], $anterior['ticket_medio'], 'currency'),
            'itens_vendidos' => $this->kpi('Itens vendidos', $atual['itens_vendidos'], $anterior['itens_vendidos'], 'number'),
            'clientes_pagantes' => $this->kpi('Clientes pagantes', $atual['clientes_pagantes'], $anterior['clientes_pagantes'], 'number'),
            'taxa_recompra' => $this->kpi('Taxa de recompra', $atual['taxa_recompra'], $anterior['taxa_recompra'], 'percent'),
            'pedidos_pendentes' => $this->kpi('Pedidos pendentes', $atual['pedidos_pendentes'], $anterior['pedidos_pendentes'], 'number'),
            'pedidos_falha' => $this->kpi('Pagamentos com falha', $atual['pedidos_falha'], $anterior['pedidos_falha'], 'number'),
        ];
    }

    private function kpi(string $rotulo, float|int $valor, float|int $anterior, string $formato): array
    {
        return [
            'rotulo' => $rotulo,
            'valor' => round((float) $valor, 2),
            'anterior' => round((float) $anterior, 2),
            'variacao_percentual' => $this->variacao($valor, $anterior),
            'formato' => $formato,
        ];
    }

    private function variacao(float|int $valor, float|int $anterior): ?float
    {
        if ((float) $anterior === 0.0) {
            return (float) $valor === 0.0 ? 0.0 : null;
        }

        return round((((float) $valor - (float) $anterior) / (float) $anterior) * 100, 2);
    }

    private function vendasPorPeriodo(Carbon $inicio, Carbon $fim): array
    {
        $granularidade = $this->granularidade($inicio, $fim);
        $formato = $granularidade === 'mes' ? 'Y-m' : 'Y-m-d';

        return Pedido::with('itens')
            ->where('status', Pedido::STATUS_PAGO)
            ->whereBetween('created_at', [$inicio, $fim])
            ->get()
            ->groupBy(fn (Pedido $pedido) => $pedido->created_at->format($formato))
            ->map(fn (Collection $pedidos, string $periodo) => [
                'periodo' => $periodo,
                'receita' => round((float) $pedidos->sum('total'), 2),
                'pedidos' => $pedidos->count(),
                'itens' => $pedidos->sum(fn (Pedido $pedido) => $pedido->itens->count()),
                'ticket_medio' => round((float) $pedidos->avg('total'), 2),
            ])
            ->values()
            ->all();
    }

    private function statusPedidos(Carbon $inicio, Carbon $fim): array
    {
        return Pedido::whereBetween('created_at', [$inicio, $fim])
            ->get()
            ->groupBy('status')
            ->map(fn (Collection $pedidos, string $status) => [
                'status' => $status,
                'pedidos' => $pedidos->count(),
                'total' => round((float) $pedidos->sum('total'), 2),
            ])
            ->values()
            ->all();
    }

    private function livrosMaisVendidos(Carbon $inicio, Carbon $fim): array
    {
        return DB::table('pedido_items')
            ->join('pedidos', 'pedidos.id', '=', 'pedido_items.pedido_id')
            ->join('livros', 'livros.id', '=', 'pedido_items.livro_id')
            ->leftJoin('autores', 'autores.id', '=', 'livros.autor_id')
            ->where('pedidos.status', Pedido::STATUS_PAGO)
            ->whereBetween('pedidos.created_at', [$inicio, $fim])
            ->groupBy('livros.id', 'livros.titulo', 'autores.nome')
            ->orderByDesc(DB::raw('count(*)'))
            ->limit(10)
            ->get([
                'livros.id as livro_id',
                'livros.titulo',
                'autores.nome as autor',
                DB::raw('count(*) as unidades'),
                DB::raw('count(distinct pedidos.id) as pedidos'),
                DB::raw('sum(pedido_items.preco) as receita'),
            ])
            ->map(fn ($item) => [
                'livro_id' => $item->livro_id,
                'titulo' => $item->titulo,
                'autor' => $item->autor,
                'unidades' => (int) $item->unidades,
                'pedidos' => (int) $item->pedidos,
                'receita' => round((float) $item->receita, 2),
            ])
            ->all();
    }

    private function receitaPorCategoria(Carbon $inicio, Carbon $fim): array
    {
        return DB::table('pedido_items')
            ->join('pedidos', 'pedidos.id', '=', 'pedido_items.pedido_id')
            ->join('livros', 'livros.id', '=', 'pedido_items.livro_id')
            ->leftJoin('categorias', 'categorias.id', '=', 'livros.categoria_id')
            ->where('pedidos.status', Pedido::STATUS_PAGO)
            ->whereBetween('pedidos.created_at', [$inicio, $fim])
            ->groupBy('categorias.id', 'categorias.nome')
            ->orderByDesc(DB::raw('sum(pedido_items.preco)'))
            ->get([
                'categorias.id as categoria_id',
                DB::raw("coalesce(categorias.nome, 'Sem categoria') as categoria"),
                DB::raw('count(*) as unidades'),
                DB::raw('sum(pedido_items.preco) as receita'),
            ])
            ->map(fn ($item) => [
                'categoria_id' => $item->categoria_id,
                'categoria' => $item->categoria,
                'unidades' => (int) $item->unidades,
                'receita' => round((float) $item->receita, 2),
            ])
            ->all();
    }

    private function clientesMaisValiosos(Carbon $inicio, Carbon $fim): array
    {
        return Pedido::with('user')
            ->where('status', Pedido::STATUS_PAGO)
            ->whereBetween('created_at', [$inicio, $fim])
            ->get()
            ->groupBy('user_id')
            ->map(fn (Collection $pedidos) => [
                'cliente_id' => $pedidos->first()->user_id,
                'nome' => $pedidos->first()->user?->name,
                'email' => $pedidos->first()->user?->email,
                'pedidos' => $pedidos->count(),
                'receita' => round((float) $pedidos->sum('total'), 2),
                'ticket_medio' => round((float) $pedidos->avg('total'), 2),
            ])
            ->sortByDesc('receita')
            ->take(10)
            ->values()
            ->all();
    }

    private function pedidosRecentes(Carbon $inicio, Carbon $fim): array
    {
        return Pedido::with(['user', 'itens'])
            ->whereBetween('created_at', [$inicio, $fim])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn (Pedido $pedido) => [
                'id' => $pedido->id,
                'cliente' => $pedido->user?->name,
                'status' => $pedido->status,
                'total' => (float) $pedido->total,
                'itens' => $pedido->itens->count(),
                'created_at' => $pedido->created_at?->toISOString(),
            ])
            ->all();
    }

    private function granularidade(Carbon $inicio, Carbon $fim): string
    {
        return $inicio->diffInDays($fim) > 120 ? 'mes' : 'dia';
    }
}
