<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('livros', function (Blueprint $table) {
            $table->string('arquivo_ebook')->nullable();
            $table->string('formato_ebook', 10)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('livros', function (Blueprint $table) {
            $table->dropColumn(['arquivo_ebook', 'formato_ebook']);
        });
    }
};
