<?php

namespace App\Services;
use App\Models\Categoria;
use Illuminate\Support\Facades\DB;
use App\Repositories\Contracts\CategoriaRepositoryInterface;

class CategoriaService{
    public function __construct(private CategoriaRepositoryInterface $repository){}

    public function criar(array $data): Categoria {
        return DB::transaction(function() use ($data){
            return $this->repository->create($data);
        });
    }

    public function atualizar(Categoria $categoria, array $data): Categoria {
        return DB::transaction(function() use ($categoria, $data){
            return $this->repository->update($categoria, $data);
        });
    }
    public function remover(Categoria $categoria): void {
        DB::transaction(function() use ($categoria){
            $this->repository->delete($categoria);
        });
    }

    public function mostrarCategoria(Categoria $categoria): Categoria {
        return DB::transaction(function() use ($categoria) {
            return $this->repository->show($categoria);
        });
    }
}
