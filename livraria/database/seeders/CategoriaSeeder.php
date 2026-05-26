<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Categoria;

class CategoriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categorias = [
            ['id' => 1, 'nome' => 'Programação',    'slug' => 'programacao'],
            ['id' => 2, 'nome' => 'Mobile',         'slug' => 'mobile'],
            ['id' => 3, 'nome' => 'Front-end',      'slug' => 'frontend'],
            ['id' => 4, 'nome' => 'Infraestrutura', 'slug' => 'infraestrutura'],
            ['id' => 5, 'nome' => 'Business',       'slug' => 'business'],
            ['id' => 6, 'nome' => 'Design e UX',    'slug' => 'design-e-ux'],
        ];

        foreach($categorias as $categoria){
            Categoria::updateOrCreate(['id' => $categoria['id']], $categoria);
        }
    }
}
