<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\LivroSeeder;
use Database\Seeders\AutorSeeder;
use Database\Seeders\LivroUserSeeder;
use Database\Seeders\CategoriaSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Database\Seeders\LivrosCatalogoAtualSeeder;
use Database\Seeders\AnalyticsPedidosSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        $this->call(RolesAndPermissionsSeeder::class);
        $this->call(UserSeeder::class);
        $this->call(AutorSeeder::class);
        $this->call(CategoriaSeeder::class);
        $this->call(LivroSeeder::class);
        $this->call(LivrosCatalogoAtualSeeder::class);
        $this->call(AnalyticsPedidosSeeder::class);
        $this->call(LivroUserSeeder::class);



        User::factory()->create([
            'name'  => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
