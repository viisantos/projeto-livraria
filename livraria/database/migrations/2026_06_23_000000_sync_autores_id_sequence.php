<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement("
            SELECT setval(
                pg_get_serial_sequence('autores', 'id'),
                COALESCE((SELECT MAX(id) FRM autores), 1),
                (SELECT COUNT(*) > 0 FROM autores)
            )
        ");
    }

    public function down(): void
    {
    }
};
