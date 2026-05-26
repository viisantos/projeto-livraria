<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class UpdateUserRequestByAdmin extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array {

         $userId = $this->route('usuario')?->id ?? $this->route('id');
         Log::info('Dados recebidos:', $this->all());
         Log::info('parâmetros da rota:', $this->route()->parameters());

        return [
            'name'     => 'sometimes|string|max:255',
            'email'    => [
                'sometimes',
                'email',
                Rule::unique('users','email')->ignore($userId),
            ],
            'role'     => 'sometimes|string|in:admin,comprador',
            'id'       =>  ''
        ];
    }
}
