<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\StoreUserRequest;
use App\Services\UserService;

class AuthController extends Controller
{
    public function __construct(protected AuthService $authService, protected UserService $userService){}
    public function login(LoginRequest $request){
        try{
            $credentials = $request->validated();
            $result      = $this->authService->login($request->validated());

            return response()->json([
                'status' => 'success',
                'user'   => $result['user'],
                'authorisation' => [
                    'token' => $result['token'],
                    'type'  => 'bearer'
                ],
            ]);
        }catch(\Exception $e){
            return response()->json([
                'message' => $e->getMessage()
            ], $e->getCode() ?: 401);
        }

    }

    public function register(StoreUserRequest $request){
        $user = $this->userService->create($request->validated());
        $user->assignRole('comprador');

        return response()->json([
            'message' => 'Usuário criado com sucesso',
            'user' => $user,
        ], 201);

    }

    public function me(){
        return response()->json($this->authService->me());
    }

    public function logout(){
        $this->authService->logout();
        return response()->json([
            'status'  => 'success',
            'message' => 'Successfully logged out',
        ]);
    }

    public function refresh(): JsonResponse{
        $result = $this->authService->refresh();
        return response()->json([
            'status' => 'success',
            'user'   => $result['user'],
            'authorisation' => [
                'token' => $result['token'],
                'type'  => 'bearer',
            ]
        ]);
    }
}
