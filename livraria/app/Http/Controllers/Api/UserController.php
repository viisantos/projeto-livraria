<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\UpdateUserRequestByAdmin;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\Request;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function __construct(protected UserService $service){

    }

    public function index(){
        $usuarios = User::with('roles')->orderBy('id', 'asc')->paginate(15);
        return response()->json(new UserCollection($usuarios));
    }

    public function show(User $usuario){
        return response()->json(new UserResource($usuario->load('roles')));
    }


    public function store(StoreUserRequest $request){
        //Gate::authorize('create', User::class);
        $user = $this->service->create($request->validated());
        if($request->filled('role')){
            $user->assignRole($request->role);
        }else{
            $user->assignRole('comprador');
        }
        return response()->json(new UserResource($user), 201);
    }

    public function update(UpdateUserRequestByAdmin $request, User $usuario){
        //Gate::authorize('update', User::class);
        try{
        //Log::info("Usuario : ". $usuario);
        //Log::info("id do usuario vindo da request". $request->id);
        $user = $this->service->update($usuario, $request->validated());
            if($request->filled('role')){
                $user->syncRoles([$request->input('role', $request->role)]);
                //$user->assignRole($request->role);
            }else{
                $user->syncRoles([$request->input('role', 'comprador')]);
                //$user->assignRole('comprador');
            }
        }catch(\Exception $e){
             Log::info(message: "Exception : ". $e);
              return response()->json($e);
        }
        return response()->json(new UserResource($user->load('roles')));
    }

    public function destroy(User $usuario){
        //Gate::authorize('delete', User::class);
        $usuario->delete();
        return response()->noContent();
    }

    //comprador pode editar a si mesmo
    public function updateSelf(UpdateUserRequest $request){
        $user = $request->user();
        //Gate::authorize('update', User::class);
        $user = $this->service->update($user, $request->validated());
        return response()->json($user);
    }

    //comprador pode deletar a si mesmo
    public function destroySelf(Request $userRequest){
        $user = $userRequest->user();
        //Gate::authorize('delete', User::class);
        $user->delete();
        return response()->noContent();
    }
}
