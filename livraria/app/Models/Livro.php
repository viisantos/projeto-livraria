<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Categoria;
use App\Models\Pedido;

class Livro extends Model
{
    use HasFactory;
    protected $table = 'livros';

    protected $fillable = [
        'autor_id',
        'titulo',
        'slug',
        'descricao',
        'isbn',
        'numero_paginas',
        'publicacao',
        'imagem_capa',
        'arquivo_ebook',
        'formato_ebook',
        'sobre',
        'preco',
        'categoria_id',
        'estoque'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    /*protected $casts = [
        'created_at',
        'updated_at'
    ];*/

    public function autor(){
        return $this->belongsTo(Autor::class, 'autor_id');
    }

    public function compradores(){
        return $this->belongsToMany(User::class);
    }

    public function favoritadoPor(){
        return $this->belongsToMany(User::class, 'livro_user')
            ->withTimestamps();
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function pedidos(){
        return $this->belongsToMany(Pedido::class, 'pedido_livro', 'livro_id', 'pedido_id')
                    ->withPivot('quantidade', 'preco')
                    ->withTimestamps();
    }

    public function pedidoItems()
    {
        return $this->hasMany(PedidoItems::class, 'livro_id');
    }





}
