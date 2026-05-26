<?php
namespace App\Repositories\Contracts;

use App\Models\Livro;
use Illuminate\Pagination\LengthAwarePaginator;

interface LivroRepositoryInterface{
    public function create(array $data): Livro;
    public function update(Livro $livro, array $data): Livro;
    public function delete(Livro $livro): void;

    public function show(Livro $livro): Livro;

    public function getCatalogoPaginado(array $filtros, int $perPage = 12): LengthAwarePaginator;



}
