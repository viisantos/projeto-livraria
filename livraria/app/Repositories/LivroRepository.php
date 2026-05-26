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
            $query->where('titulo', 'like', '%' . $filtros['busca'] . '%');
        }

        if(!empty($filtros['categoria'])){
            $query->whereHas('categoria', function($q) use ($filtros) {
                $q->where('slug', $filtros['categoria']);
            });
        }

        return $query->paginate($perPage);
     }

}
