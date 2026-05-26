<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::insert([
            [
                'name' => 'Ana Souza',
                'email' => 'ana@email.com',
                'password' => Hash::make('123456'),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Carlos Pereira',
                'email' => 'carlos@email.com',
                'password' => Hash::make('123456'),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $usuarios = [
            ['name' => 'Alice Souza',       'email' => 'alice@email.com'],
            ['name' => 'Bruno Lima',        'email' => 'bruno@email.com'],
            ['name' => 'Carla Mendes',      'email' => 'carla@email.com'],
            ['name' => 'Daniel Costa',      'email' => 'daniel@email.com'],
            ['name' => 'Elena Ferreira',    'email' => 'elena@email.com'],
            ['name' => 'Felipe Rocha',      'email' => 'felipe@email.com'],
            ['name' => 'Gabriela Nunes',    'email' => 'gabriela@email.com'],
            ['name' => 'Henrique Alves',    'email' => 'henrique@email.com'],
            ['name' => 'Isabela Castro',    'email' => 'isabela@email.com'],
            ['name' => 'João Pereira',      'email' => 'joao@email.com'],
            ['name' => 'Karina Oliveira',   'email' => 'karina@email.com'],
            ['name' => 'Lucas Martins',     'email' => 'lucas@email.com'],
            ['name' => 'Mariana Ribeiro',   'email' => 'mariana@email.com'],
            ['name' => 'Nicolas Carvalho',  'email' => 'nicolas@email.com'],
            ['name' => 'Olivia Pinto',      'email' => 'olivia@email.com'],
            ['name' => 'Paulo Gomes',       'email' => 'paulo@email.com'],
            ['name' => 'Queila Barbosa',    'email' => 'queila@email.com'],
            ['name' => 'Rafael Correia',    'email' => 'rafael@email.com'],
            ['name' => 'Sabrina Dias',      'email' => 'sabrina@email.com'],
            ['name' => 'Thiago Monteiro',   'email' => 'thiago@email.com'],
            ['name' => 'Ursula Teixeira',   'email' => 'ursula@email.com'],
            ['name' => 'Vitor Fernandes',   'email' => 'vitor@email.com'],
            ['name' => 'Wendy Cardoso',     'email' => 'wendy@email.com'],
            ['name' => 'Xavier Moreira',    'email' => 'xavier@email.com'],
            ['name' => 'Yasmin Ramos',      'email' => 'yasmin@email.com'],
            ['name' => 'Zeca Azevedo',      'email' => 'zeca@email.com'],
            ['name' => 'Amanda Cunha',      'email' => 'amanda@email.com'],
            ['name' => 'Bernardo Lopes',    'email' => 'bernardo@email.com'],
            ['name' => 'Cecilia Freitas',   'email' => 'cecilia@email.com'],
            ['name' => 'Diego Santana',     'email' => 'diego@email.com'],
            ['name' => 'Elisa Figueiredo',  'email' => 'elisa@email.com'],
            ['name' => 'Fabio Macedo',      'email' => 'fabio@email.com'],
            ['name' => 'Gloria Nascimento', 'email' => 'gloria@email.com'],
            ['name' => 'Hugo Cavalcante',   'email' => 'hugo@email.com'],
            ['name' => 'Iris Vieira',       'email' => 'iris@email.com'],
            ['name' => 'Jorge Barros',      'email' => 'jorge@email.com'],
            ['name' => 'Kelly Melo',        'email' => 'kelly@email.com'],
            ['name' => 'Leonardo Cruz',     'email' => 'leonardo@email.com'],
            ['name' => 'Monica Queiroz',    'email' => 'monica@email.com'],
            ['name' => 'Nelson Pires',      'email' => 'nelson@email.com'],
        ];

        foreach ($usuarios as $index => $dados) {
            $user = User::create([
                'name'     => $dados['name'],
                'email'    => $dados['email'],
                'password' => Hash::make('12345678'),
            ]);

            // Alterna entre admin e comprador pelo índice
            $role = $index % 2 === 0 ? 'admin' : 'comprador';
            $user->assignRole($role);
        }
    }
}
