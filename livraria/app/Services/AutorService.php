<?php

namespace App\Services;
use App\Models\Autor;
use Illuminate\Support\Facades\DB;
use App\Repositories\Contracts\AutorRepositoryInterface;

class AutorService{
    public function __construct(private AutorRepositoryInterface $repository){}
    public function criar(array $data): Autor {
        return DB::transaction(function() use ($data){
            return $this->repository->create($data);
        });
    }
    public function atualizar(Autor $autor, array $data): Autor{
        return DB::transaction(function() use ($autor, $data){
            return $this->repository->update($autor, $data);
        });
    }
    public function remover(Autor $autor): void {
        DB::transaction(function() use ($autor){
            $this->repository->delete($autor);
        });
    }

    public function mostrarAutor(Autor $autor): Autor {
        return DB::transaction(function() use ($autor) {
            return $this->repository->show($autor);
        });
    }
}

