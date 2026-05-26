<?php

namespace App\Policies;

use App\Models\Autor;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AutorPolicy
{
    /**
     * Determine whether the user can view any models.
     * Parei no tópico "utilizando na controller" no
     * tutorial do chatgpt.(Ok, continuei no Claude)
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('manage authors') || $user->hasPermissionTo('view admin lists');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Autor $autor): bool
    {
        return $user->hasPermissionTo('manage authors') || $user->hasPermissionTo('view admin lists');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo(permission: 'manage authors');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Autor $autor): bool
    {
        return $user->hasPermissionTo('manage authors');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Autor $autor): bool
    {
        return $user->hasPermissionTo('manage authors');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Autor $autor): void
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Autor $autor): void
    {
        //
    }
}
