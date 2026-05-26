<?php
namespace App\Repositories\Contracts;
use App\Models\Pedido;

interface PedidoRepositoryInterface{
    public function createPedidoWithItems(int $userId, float $total, string $stripeIntentId, array $items): ?Pedido;

    public function updateStatusByStripeId(string $stripeIntentId, string $status): void;

    public function findByStripeId(string $stripePaymentId): ?Pedido;
}
