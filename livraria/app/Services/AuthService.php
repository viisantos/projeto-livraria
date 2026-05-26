<?php

namespace App\Services;

use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Models\User;

class AuthService{
    public function __construct(protected UserRepositoryInterface $userRepository){}

    public function login(array $credentials): array {
        $token = auth('api')->attempt($credentials);

        if(!$token){
            throw new \Exception('Credenciais inválidas', 401);
        }

        return [
            'user'  => auth('api')->user(),
            'perfil' => auth('api')->user()->roles->first()->name,
            'token' => $token
        ];
    }

    public function me(){
        return auth('api')->user();
    }

    public function logout(): void{
        auth('api')->logout();
    }

    public function refresh(): array {
        return [
            'user'  => auth('api')->user(),
            'perfil' => auth('api')->user()->roles->first()->name,
            'token' => JWTAuth::refresh(JWTAuth::getToken()),
        ];
    }
}

