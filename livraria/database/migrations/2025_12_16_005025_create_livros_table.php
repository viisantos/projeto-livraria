<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
            Schema::create('livros', function (Blueprint $table) {
            $table->id();
            //$table->integer('categoria_id');
            //$table->foreignId('categoria_id')->constrained();
            $table->unsignedBigInteger('autor_id');
            $table->foreign('autor_id')->references('id')->on('autores')->onDelete('cascade')->onUpdate('cascade');
            $table->string('titulo');
            $table->string('slug')->unique();
            $table->text('descricao')->nullable();
            $table->string('isbn')->nullable();
            $table->integer('numero_paginas');
            $table->date('publicacao');
            $table->string('imagem_capa');
            $table->text('sobre');
            $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('livros');
    }
};
