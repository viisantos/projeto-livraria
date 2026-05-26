<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StoreLivroRequest extends FormRequest{
    //public function authorize(): bool{
    //    return true;
    //}

    public function rules(): array{
        return [
            'autor_id'       => 'required|exists:autores,id',
            'titulo'         => 'required|string|max:255',
            'slug'           => 'string',
            'descricao'      => 'nullable|string',
            'isbn'           => 'string|max:255',
            'numero_paginas' => 'integer',
            'publicacao'     => 'date',
            'imagem_capa'    => 'string',
            'sobre'          => 'string',
            'categoria_id'   => 'required|exists:categorias,id',
            'preco'          => 'required|numeric',
            'estoque'        => 'integer|min:0'
        ];
    }
}
