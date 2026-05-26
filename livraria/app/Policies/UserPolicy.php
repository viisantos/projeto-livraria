<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $authUser): bool
    {
        return $authUser->hasRole('admin');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $authUser, User $user): bool
    {
         return $authUser->hasRole('admin') || $authUser->is($user);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $authUser): bool
    {
       return $authUser->hasRole('admin');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $authUser, User $user): bool
    {
        return $authUser->is($user) || $authUser->hasRole('admin');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $authUser, User $user): bool
    {
        return $authUser->hasRole('admin') || $authUser->is($user);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, User $model): void
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, User $model): void
    {
        //
    }
}
