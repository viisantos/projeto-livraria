<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BibliotecaLivroResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $leituraDisponivel = $this->formato_ebook === 'pdf' && filled($this->arquivo_ebook);

        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'slug' => $this->slug,
            'descricao' => $this->descricao,
            'imagem_capa' => $this->imagem_capa,
            'formato_ebook' => $this->formato_ebook,
            'leitura_disponivel' => $leituraDisponivel,
            'endpoint_leitura' => $this->when(
                $leituraDisponivel,
                "/api/biblioteca/livros/{$this->id}/leitura"
            ),
            'adquirido_em' => $this->adquirido_em,
            'autor' => new AutorResource($this->whenLoaded('autor')),
            'categoria' => new CategoriaResource($this->whenLoaded('categoria')),
        ];
    }
}
