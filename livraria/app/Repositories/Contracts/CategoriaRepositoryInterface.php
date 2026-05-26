<?php
namespace App\Repositories\Contracts;

use App\Models\Categoria;

interface CategoriaRepositoryInterface{
    public function create(array $data): Categoria;
    public function update(Categoria $categoria, array $data): Categoria;
    public function delete(Categoria $categoria): void;
    public function show(Categoria $categoria): Categoria;

}
