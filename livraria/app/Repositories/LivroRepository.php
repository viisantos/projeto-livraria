<?php

namespace App\Repositories;

use App\Models\Livro;
use App\Repositories\Contracts\LivroRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class LivroRepository implements LivroRepositoryInterface{
    public function create(array $data): Livro {
        /*
        $livro = new Livro();
        $livro->categoria_id    = $data['categoria_id'];
        $livro->autor_id        = $data['autor_id'];
        $livro->titulo          = $data['titulo'];
        $livro->slug            = $data['slug'];
        $livro->descricao       = $data['descricao'];
        $livro->isbn            = $data['isbn'];
        $livro->numero_paginas  = $data['numero_paginas'];
        $livro->publicacao      = $data['publicacao'];
        $livro->imagem_capa     = $data['imagem_capa'];
        $livro->sobre           = $data['sobre'];

        $livro->save();*/

        $livro = Livro::create($data);
        return $livro;
    }

    public function update(Livro $livro, array $data): Livro{
        $livro->fill($data);
        $livro->save();
        return $livro;
     }

     public function delete(Livro $livro): void {
        $livro->delete();
     }

     public function show(Livro $livro): Livro {
        $livro = Livro::with(['autor','categoria'])->findOrFail($livro->id);
        return $livro;
     }

     public function getCatalogoPaginado(array $filtros, int $perPage = 12): LengthAwarePaginator {
        $query = Livro::with(['autor','categoria']);

        if (!empty($filtros['busca'])) {
            $busca = mb_strtolower($filtros['busca']);

            $query->where(function ($q) use ($busca) {
                $q->whereRaw('LOWER(titulo) like ?', ['%' . $busca . '%'])
                    ->orWhereRaw('LOWER(descricao) like ?', ['%' . $busca . '%'])
                    ->orWhereRaw('LOWER(isbn) like ?', ['%' . $busca . '%'])
                    ->orWhereHas('autor', function ($autorQuery) use ($busca) {
                        $autorQuery->whereRaw('LOWER(nome) like ?', ['%' . $busca . '%']);
                    });
            });
        }

        if (!empty($filtros['categoria_id'])) {
            $query->where('categoria_id', $filtros['categoria_id']);
        }

        if (!empty($filtros['categoria'])) {
            $categoria = $filtros['categoria'];

            $query->whereHas('categoria', function($q) use ($categoria) {
                $q->where('slug', $categoria)
                    ->orWhere('nome', 'like', '%' . $categoria . '%');
            });
        }

        if (!empty($filtros['autor_id'])) {
            $query->where('autor_id', $filtros['autor_id']);
        }

        if (!empty($filtros['autor'])) {
            $autor = mb_strtolower($filtros['autor']);

            $query->whereHas('autor', function($q) use ($autor) {
                $q->whereRaw('LOWER(nome) like ?', ['%' . $autor . '%']);
            });
        }

        if (isset($filtros['min_preco']) && $filtros['min_preco'] !== '') {
            $query->where('preco', '>=', $filtros['min_preco']);
        }

        if (isset($filtros['max_preco']) && $filtros['max_preco'] !== '') {
            $query->where('preco', '<=', $filtros['max_preco']);
        }

        $this->aplicarOrdenacao($query, $filtros['ordenar'] ?? null);

        $perPage = (int)($filtros['per_page'] ?? $perPage);
        $perPage = max(1, min($perPage, 50));

        return $query->paginate($perPage);
     }

     private function aplicarOrdenacao($query, ?string $ordenacao): void
     {
        match ($ordenacao) {
            'titulo_az'   => $query->orderBy('titulo'),
            'titulo_za'   => $query->orderByDesc('titulo'),
            'preco_menor' => $query->orderBy('preco'),
            'preco_maior' => $query->orderByDesc('preco'),
            'mais_antigos' => $query->orderBy('id'),
            default => $query->orderByDesc('id'),
        };
     }

}
