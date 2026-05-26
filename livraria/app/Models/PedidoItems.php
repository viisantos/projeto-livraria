<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class PedidoItems extends Model
{
    use HasFactory;

    protected $table = 'pedido_items';

    protected $fillable = [
        'pedido_id',
        'livro_id',
        'quantidade',
        'preco'
    ];

    public function pedido()
    {
        return $this->belongsTo(Pedido::class);
    }

    public function livro()
    {
        return $this->belongsTo(Livro::class);
    }
}
