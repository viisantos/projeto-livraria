<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\CategoriaService;
use App\Http\Requests\StoreCategoriaRequest;
use App\Http\Requests\UpdateCategoriaRequest;
use Illuminate\Http\JsonResponse;
use App\Models\Categoria;
use Illuminate\Support\Facades\Gate;
use App\Http\Resources\CategoriaCollection;
use App\Http\Resources\CategoriaResource;

class CategoriaController extends Controller
{
    public function __construct(private CategoriaService $categoriaService){}

    public function index(){
        //Gate::authorize('viewAny', Categoria::class);
        $categorias = Categoria::orderBy('id', 'asc')->paginate(15);
        return response()->json(new CategoriaCollection($categorias));
    }

    public function store(StoreCategoriaRequest $categoriaRequest){
        //Gate::authorize('create', Categoria::class);
        $categoria = $this->categoriaService->criar($categoriaRequest->validated());
        return response()->json(new CategoriaResource($categoria), 201);
    }

    public function show(Categoria $categoria){
        //Gate::authorize('view', Categoria::class);
        $response = $this->categoriaService->mostrarCategoria($categoria);
        return response()->json(new CategoriaResource($response));
    }

    public function update(UpdateCategoriaRequest $request, Categoria $categoria){
        //Gate::authorize('update', Categoria::class);
        $categoria = $this->categoriaService->atualizar($categoria, $request->validated());
        return response()->json(new CategoriaResource($categoria));
    }

    public function destroy(Categoria $categoria)
    {
        //Gate::authorize('delete', Categoria::class);
        $this->categoriaService->remover($categoria);
        return response()->noContent();
    }

}
