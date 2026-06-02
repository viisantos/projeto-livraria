<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $duplicados = DB::table('livro_user')
            ->select('user_id', 'livro_id', DB::raw('MIN(id) as keep_id'))
            ->groupBy('user_id', 'livro_id')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicados as $duplicado) {
            DB::table('livro_user')
                ->where('user_id', $duplicado->user_id)
                ->where('livro_id', $duplicado->livro_id)
                ->where('id', '<>', $duplicado->keep_id)
                ->delete();
        }

        Schema::table('livro_user', function (Blueprint $table) {
            $table->unique(['user_id', 'livro_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('livro_user', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'livro_id']);
        });
    }
};
