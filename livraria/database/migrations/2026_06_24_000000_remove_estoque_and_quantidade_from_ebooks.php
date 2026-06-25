<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('livros', fn (Blueprint $table) => $table->dropColumn('estoque'));
        Schema::table('pedido_items', fn (Blueprint $table) => $table->dropColumn('quantidade'));
    }

    public function down(): void
    {
        Schema::table('livros', fn (Blueprint $table) => $table->integer('estoque')->default(0));
        Schema::table('pedido_items', fn (Blueprint $table) => $table->integer('quantidade')->default(1));
    }
};
