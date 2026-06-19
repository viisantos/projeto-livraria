<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('pedidos')
            ->where('status', 'pending')
            ->update(['status' => 'pendente']);
    }

    public function down(): void
    {
        DB::table('pedidos')
            ->where('status', 'pendente')
            ->update(['status' => 'pending']);
    }
};
