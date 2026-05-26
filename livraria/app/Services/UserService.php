<?php
namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Log;

class UserService{
    public function __construct(protected UserRepositoryInterface $repository){}

    public function create(array $data): User {
        return $this->repository->create($data);
    }


    public function update(User $usuario, array $data): User {
        //$user->password = User::find($data->id)->password;
        return $this->repository->update($usuario, $data);
    }
}
