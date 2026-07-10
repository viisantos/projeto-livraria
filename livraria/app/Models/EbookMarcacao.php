<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EbookMarcacao extends Model
{
    use HasFactory;

    public const TIPO_MARCADOR = 'marcador';
    public const TIPO_DESTAQUE = 'destaque';
    public const TIPO_ANOTACAO = 'nota';

    protected $table = 'ebook_marcacoes';

    protected $fillable = [
        'user_id',
        'livro_id',
        'tipo',
        'pagina',
        'texto',
        'cor',
        'retangulos',
    ];

    protected $casts = [
        'pagina' => 'integer',
        'retangulos' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function livro(): BelongsTo
    {
        return $this->belongsTo(Livro::class);
    }
}
