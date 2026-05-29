<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Livro;
use App\Models\Autor;
use App\Services\LivroService;
use App\Http\Requests\StoreLivroRequest;
use App\Http\Requests\UpdateLivroRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use App\Http\Resources\LivroCollection;
use App\Http\Resources\LivroResource;
use Illuminate\Support\Facades\Log;

class LivroController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function __construct(
        private LivroService $service
    ){}
    public function index(Request $request): JsonResponse
    {
        //Gate::authorize('viewAny', Livro::class);
        $livros = $this->service->listarCatalogo($request->query());

        return response()->json(new LivroCollection($livros));
    }

    public function catalogo(Request $request): JsonResponse
    {
        $filtros = $request->query();
        $livros = $this->service->listarCatalogo($filtros);

        return response()->json(new LivroCollection($livros));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLivroRequest $request)
    {
        /*$data = $request->validate([
            'categoria_id'   => ['required', 'exists:categorias,id'],
            'autor_id'       => ['required', 'exists:autores,id'],
            'titulo'         => 'required|string|max:255',
            'slug'           => 'required|string|unique:livros',
            'descricao'      => 'nullable|string',
            'isbn'           => 'required|string',
            'numero_paginas' => 'required|integer',
            'publicacao'     => 'required|date',
            'imagem_capa'    => 'nullable|string',
            'autor_id'       => 'required|exists:autores,id',
            'sobre'          => 'nullable|string'
        ]);*/
        //Gate::authorize('create', Livro::class);
        Log::info("Livro : ". $request);
        $livro = $this->service->criar($request->validated());

        return response()->json($livro, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Livro $livro): JsonResponse
    {
        //Gate::authorize('view', $livro);
        $response = $this->service->mostrarLivro($livro);
        return response()->json(new LivroResource($response));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLivroRequest $request, Livro $livro)
    {
        //Gate::authorize('update', $livro);
        $livro = $this->service->atualizar($livro, $request->validated());
        return response()->json(new LivroResource($livro));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Livro $livro)
    {
        //Gate::authorize('delete', $livro);
        $this->service->remover($livro);
        return response()->noContent();
    }
}
