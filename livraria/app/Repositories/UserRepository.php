<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserRepository implements UserRepositoryInterface{


    public function create(array $data): User {
        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);
        return $user;
    }

    public function update(User $usuario, array $data): User {
        //Log::info("Usuário  : ".$user);
        $user = User::find($usuario->id);
        //$data['password'] = User::find($usuario->id)->password;

        //Log::info($data);
        //if(isset($data['password'])){
        //    $data['password'] = Hash::make($data['password']);
        //}
        $user->fill($data);
        $user->save();
        return $user;
    }

    public function findByEmail(string $email): ?User {
        $user = User::where('email', $email)->first();
        return $user;
    }
}
