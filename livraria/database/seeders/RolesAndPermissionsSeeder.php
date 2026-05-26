<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        $admin     = Role::create(['name' => 'admin']);
        $comprador = Role::create(['name' => 'comprador']);

        $permissions = [
            'manage authors',
            'manage categories',
            'manage books',
            'manage users',
            'view admin lists',
            'buy books',
            'favorite books',
        ];

        foreach ($permissions as $permission){
            Permission::create(['name' => $permission]);
        }

        $admin->givePermissionTo(Permission::all());

        $comprador->givePermissionTo([
            'buy books',
            'favorite books',
        ]);
    }
}
