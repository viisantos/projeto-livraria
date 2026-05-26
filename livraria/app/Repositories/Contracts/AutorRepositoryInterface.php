<?php
namespace App\Repositories\Contracts;

use App\Models\Autor;

interface AutorRepositoryInterface{
    public function create(array $data): Autor;
    public function update(Autor $autor, array $data): Autor;
    public function delete(Autor $autor): void;

    public function show(Autor $autor): Autor;

}
