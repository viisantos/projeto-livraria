<?php

namespace Database\Seeders;

use App\Models\Livro;
use App\Models\Pedido;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AnalyticsPedidosSeeder extends Seeder
{
    private const TOTAL_PEDIDOS = 10000;
    private const EMAIL_DOMINIO = 'example.com';
    private const EMAIL_PREFIXO = 'analytics.seed.';

    public function run(): void
    {
        $livros = Livro::query()
            ->where('preco', '>', 0)
            ->get(['id', 'preco'])
            ->values();

        if ($livros->count() < 3) {
            $this->command?->warn('AnalyticsPedidosSeeder precisa de pelo menos 3 livros com preço maior que zero.');
            return;
        }

        $this->limparDadosAnteriores();
        $this->criarUsuarios();

        $usuarios = User::query()
            ->where('email', 'like', self::EMAIL_PREFIXO.'%@'.self::EMAIL_DOMINIO)
            ->orderBy('id')
            ->pluck('id')
            ->values();

        $this->atribuirRoleComprador($usuarios);
        $this->criarPedidos($usuarios, $livros);
    }

    private function limparDadosAnteriores(): void
    {
        $usuariosIds = User::query()
            ->where('email', 'like', self::EMAIL_PREFIXO.'%@'.self::EMAIL_DOMINIO)
            ->pluck('id');

        if ($usuariosIds->isEmpty()) {
            return;
        }

        DB::table('model_has_roles')
            ->where('model_type', User::class)
            ->whereIn('model_id', $usuariosIds)
            ->delete();

        User::query()
            ->whereIn('id', $usuariosIds)
            ->delete();
    }

    private function criarUsuarios(): void
    {
        $senha = Hash::make('password');
        $agora = now();

        foreach (array_chunk(range(1, self::TOTAL_PEDIDOS), 1000) as $grupo) {
            $usuarios = [];

            foreach ($grupo as $numero) {
                $usuarios[] = [
                    'name' => 'Cliente Analytics '.str_pad((string) $numero, 5, '0', STR_PAD_LEFT),
                    'email' => self::EMAIL_PREFIXO.str_pad((string) $numero, 5, '0', STR_PAD_LEFT).'@'.self::EMAIL_DOMINIO,
                    'email_verified_at' => $agora,
                    'password' => $senha,
                    'remember_token' => null,
                    'created_at' => $agora,
                    'updated_at' => $agora,
                ];
            }

            DB::table('users')->insert($usuarios);
        }
    }

    private function atribuirRoleComprador($usuarios): void
    {
        $roleId = DB::table('roles')->where('name', 'comprador')->value('id');

        if (!$roleId) {
            return;
        }

        foreach ($usuarios->chunk(1000) as $grupo) {
            $roles = $grupo->map(fn ($userId) => [
                'role_id' => $roleId,
                'model_type' => User::class,
                'model_id' => $userId,
            ])->all();

            DB::table('model_has_roles')->insert($roles);
        }
    }

    private function criarPedidos($usuarios, $livros): void
    {
        $inicio = now()->subYear()->startOfDay();
        $fim = now()->endOfDay();
        $segundosPeriodo = $inicio->diffInSeconds($fim);

        foreach ($usuarios as $indice => $userId) {
            $livrosDoPedido = $livros->random(random_int(1, 3))->values();
            $total = round((float) $livrosDoPedido->sum(fn ($livro) => (float) $livro->preco), 2);
            $dataPedido = $inicio->copy()->addSeconds(random_int(0, $segundosPeriodo));
            $status = $this->statusAleatorio();

            $pedidoId = DB::table('pedidos')->insertGetId([
                'user_id' => $userId,
                'total' => $total,
                'stripe_payment_id' => 'analytics_seed_'.str_pad((string) ($indice + 1), 5, '0', STR_PAD_LEFT),
                'status' => $status,
                'created_at' => $dataPedido,
                'updated_at' => $dataPedido,
            ]);

            $itens = $livrosDoPedido->map(fn ($livro) => [
                'pedido_id' => $pedidoId,
                'livro_id' => $livro->id,
                'preco' => $livro->preco,
                'created_at' => $dataPedido,
                'updated_at' => $dataPedido,
            ])->all();

            DB::table('pedido_items')->insert($itens);
        }
    }

    private function statusAleatorio(): string
    {
        $numero = random_int(1, 100);

        return match (true) {
            $numero <= 92 => Pedido::STATUS_PAGO,
            $numero <= 97 => Pedido::STATUS_PENDENTE,
            default => Pedido::STATUS_FALHA,
        };
    }
}
