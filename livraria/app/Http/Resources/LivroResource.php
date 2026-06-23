<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LivroResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'titulo'         => $this->titulo,
            'slug'           => $this->slug,
            'descricao'      => $this->descricao,
            'isbn'           => $this->isbn,
            'numero_paginas' => $this->numero_paginas,
            'publicacao'     => $this->publicacao,
            'imagem_capa'    => $this->imagem_capa,
            'formato_ebook'  => $this->formato_ebook,
            'sobre'          => $this->sobre,
            'preco'          => $this->preco,

            //Relacionamentos - só aparecem se forem carregados com with() - evita problema de performance e "N+1".
            'autor'         => new AutorResource($this->whenLoaded('autor')),
            'categoria'     => new CategoriaResource($this->whenLoaded('categoria')),
            'estoque'       => $this->estoque
           //'criado_em'     => $this->created_at->format('d/m/Y'),
           //'atualizado_em' => $this->updated_at->format('d/m/Y')
        ];
    }
}
