<?php

namespace App\Repositories;

use App\Models\Categoria;
use App\Repositories\Contracts\CategoriaRepositoryInterface;

class CategoriaRepository implements CategoriaRepositoryInterface{
    public function create(array $data): Categoria {
        $categoria = Categoria::create($data);
        return $categoria;
    }

    public function update(Categoria $categoria, array $data): Categoria{
        $categoria->fill($data);
        $categoria->save();
        return $categoria;
     }

     public function delete(Categoria $categoria): void {
        $categoria->delete();
     }

     public function show(Categoria $categoria): Categoria {
        $categoria = Categoria::findOrFail($categoria->id);
        return $categoria;
     }
}
