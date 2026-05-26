<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\PedidoItems;
use App\Models\Livro;

class Pedido extends Model
{
    use HasFactory;

    protected $table = 'pedidos';

    protected $fillable = [
        'user_id',
        'total',
        'stripe_payment_id',
        'status'
    ];

    public function itens(): hasMany
    {
        return $this->hasMany(PedidoItems::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    //acessar os livros
    public function livro(): BelongsToMany
    {
        return $this->belongsToMany(Livro::class, 'pedido_items', 'pedido_id', 'livro_id')
                    ->withPivot('quantidade', 'preco')
                    ->withTimestamps();
    }

}
