<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\LivroController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\AutorController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PagamentoController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\historicoPedidos;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Aqui ficam TODAS as rotas da sua API (JSON)
| Prefixo automático: /api
|--------------------------------------------------------------------------
*/

// rota de teste (sanity check)
Route::get('/ping', function () {
    return response()->json(['status' => 'ok']);
});



// 🔓 ROTAS DE TESTE (SEM AUTH)
Route::prefix('')->group(function () {
    Route::get('/debug-ssl', function () {
    return response()->json([
        'curl.cainfo' => ini_get('curl.cainfo'),
        'openssl.cafile' => ini_get('openssl.cafile')
        ]);
});
    Route::post('register', [UserController::class, 'store']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);
});

// 🔐 ROTAS PROTEGIDAS (para depois)
// Route::middleware('auth:sanctum')->group(function () {
//     Route::post('/comprar-livro', [CompraController::class, 'store']);
// });


Route::middleware('auth:api')->get('/jwt-test', function(){
    return response()->json(auth('api')->user());
});

/*
Route::middleware('auth')->group(function(){
    Route::apiResource('categorias', CategoriaController::class);
    Route::apiResource('autor', AutorController::class);
    Route::apiResource('livros', LivroController::class);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/users',         [UserController::class, 'index']);
    Route::get('/users/{id}',    [UserController::class, 'show']);
    Route::put('/users/{id}',    [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    //Route::apiResource('users', UserController::class);

});*/

Route::middleware('auth')->group(function(){
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    //comprador gerencia a si mesmo
    Route::put('/me', [UserController::class, 'updateSelf']);
    Route::delete('/me', [UserController::class, 'destroySelf']);

    //comprador e admin, ambos podem visuaizar catálogo
    Route::get('/livros', [LivroController::class, 'index']);
    Route::get('/livros/{livro}', [LivroController::class, 'show']);

    Route::apiResource('categorias', CategoriaController::class);
    Route::post('/payment/intent', [PagamentoController::class, 'intencaoPagamento']);
    Route::get('/historico-pedidos', [historicoPedidos::class, 'historico_pedidos']);


    //oprerações restritas à admin:
    Route::middleware('role:admin')->group(function(){
        Route::post('/livros', [LivroController::class, 'store']);
        Route::put('/livros/{livro}', [LivroController::class, 'update']);
        Route::delete('/livros/{livro}', [LivroController::class, 'destroy']);

        Route::apiResource('autores', AutorController::class);

        Route::apiResource('usuarios', UserController::class);
    });
});



Route::middleware('jwt.refresh')->group(function(){
    Route::post('/refresh', [AuthController::class, 'refresh']);
});

Route::get('/ping', function () {
    return response()->json(['pong' => true]);
});

