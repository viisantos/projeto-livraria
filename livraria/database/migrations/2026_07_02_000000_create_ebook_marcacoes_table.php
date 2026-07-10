<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ebook_marcacoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('livro_id')->constrained('livros')->cascadeOnDelete();
            $table->string('tipo', 20);
            $table->unsignedInteger('pagina');
            $table->text('texto')->nullable();
            $table->string('cor', 20)->nullable();
            $table->json('retangulos')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'livro_id', 'tipo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ebook_marcacoes');
    }
};
