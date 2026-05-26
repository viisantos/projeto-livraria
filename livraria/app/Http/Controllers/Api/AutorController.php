<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Autor;
use App\Services\AutorService;
use App\Http\Requests\StoreAutorRequest;
use App\Http\Requests\UpdateAutorRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use App\Http\Resources\AutorCollection;
use App\Http\Resources\AutorResource;
use Illuminate\Support\Facades\Log;

class AutorController extends Controller
{
    public function __construct(
        private AutorService $service
    ){}
    public function index()
    {
        //Gate::authorize('viewAny', Autor::class);
        try{
        $autores = Autor::orderBy('id', 'asc')->paginate(15);
        }catch(\Exception $e){
            Log::info(message: "Exception : ". $e);
        }
        return response()->json(new AutorCollection($autores));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAutorRequest $request)
    {

        //Gate::authorize('create', Autor::class);
        $autor = $this->service->criar($request->validated());
        Log::info(message: "Request : ". $request);
        return response()->json(new AutorResource($autor), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Autor $autore): JsonResponse
    {
        //Log::info(message: "Autor : ". $autore);
        //Gate::authorize('view', Autor::class);
        $response = $this->service->mostrarAutor($autore);
        return response()->json(new AutorResource($response));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAutorRequest $request, Autor $autore)
    {

        //Gate::authorize('update', Autor::class);
        $autor = $this->service->atualizar($autore, $request->validated());
        return response()->json(new AutorResource($autor));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Autor $autore)
    {
        //Gate::authorize('delete', Autor::class);
        $this->service->remover($autore);
        return response()->noContent();
    }
}
