<?php

namespace App\Repositories;

use App\Models\Autor;
use App\Repositories\Contracts\AutorRepositoryInterface;

class AutorRepository implements AutorRepositoryInterface{
    public function create(array $data): Autor {
        $autor = Autor::create($data);
        return $autor;
    }

    public function update(Autor $autor, array $data): Autor{
        $autor->fill($data);
        $autor->save();
        return $autor;
     }

     public function delete(Autor $autor): void {
        $autor->delete();
     }

     public function show(Autor $autor): Autor {
        $autor = Autor::findOrFail($autor->id);
        return $autor;
     }
}
