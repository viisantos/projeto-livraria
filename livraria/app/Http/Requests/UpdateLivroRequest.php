<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLivroRequest extends StoreLivroRequest{
    public function authorize(): bool{
        return true;
    }

    public function rules(): array{
       return [
            'autor_id'       => 'sometimes|exists:autores,id',
            'titulo'         => 'sometimes|string|max:255',
            'slug'           => 'string',
            'descricao'      => 'nullable|string',
            'isbn'           => 'string|max:255',
            'numero_paginas' => 'integer',
            'publicacao'     => 'date',
            'imagem_capa'    => 'string',
            'arquivo_ebook'  => 'nullable|string|max:255|required_with:formato_ebook',
            'formato_ebook'  => 'nullable|in:pdf,epub|required_with:arquivo_ebook',
            'ebook'          => 'nullable|file|mimes:pdf,epub|max:51200',
            'sobre'          => 'string',
            'categoria_id'   => 'sometimes|exists:categorias,id',
            'preco'          => 'sometimes|numeric',
            'estoque'        => 'sometimes|integer|min:0'
        ];
    }
}
