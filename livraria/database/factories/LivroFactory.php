<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Autor;
use App\Models\Categoria;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Livro>
 */
class LivroFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $titulo = fake()->sentence(3);

    return [
        'autor_id' => Autor::factory(),
        'categoria_id' => Categoria::factory(),
        'titulo' => $titulo,
        'slug' => \Illuminate\Support\Str::slug($titulo),
        'descricao' => $this->faker->paragraph(2),
        'numero_paginas' => fake()->numberBetween(100, 500),
        'publicacao' => fake()->date(),
        'imagem_capa' => fake()->imageUrl(),
        'sobre' => $this->faker->paragraphs(3, true),
        'preco' => fake()->randomFloat(2, 9, 199),
    ];
    }
}
