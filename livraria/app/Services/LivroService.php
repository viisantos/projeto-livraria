<?php

namespace App\Services;
use App\Models\Livro;
use Illuminate\Support\Facades\DB;
use App\Repositories\Contracts\LivroRepositoryInterface;

class LivroService{
    public function __construct(private LivroRepositoryInterface $repository){}
    public function criar(array $data): Livro {
        return DB::transaction(function() use ($data){
            return $this->repository->create($data);
        });
    }
    public function atualizar(Livro $livro, array $data): Livro{
        return DB::transaction(function() use ($livro, $data){
            return $this->repository->update($livro, $data);
        });
    }
    public function remover(Livro $livro): void {
        DB::transaction(function() use ($livro){
            $this->repository->delete($livro);
        });
    }

    public function mostrarLivro(Livro $livro): Livro {
        return DB::transaction(function() use ($livro) {
            return $this->repository->show($livro);
        });
    }

    public function listarCatalogo(array $filtros){
        return $this->repository->getCatalogoPaginado($filtros);
    }
}
