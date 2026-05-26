<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class AutorCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total'         => $this->total(),
                'por_pagina'    => $this->perPage(),
                'pagina_atual'  => $this->currentPage(),
                'ultima_pagina' => $this->lastPage()
            ]
        ];
    }
}
