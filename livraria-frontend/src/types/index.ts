export interface User{
    id: number
    name: string
    email: string
    perfil: 'admin'|'comprador'
    criado_em: string
}

export interface Autor{
    id: number
    nome: string
    sobre: string
    criado_em: string
}

export interface Categoria{
    id: number
    nome: string
    slug: string
    criado_em: string
}

export interface Livro{
    id: number
    titulo: string
    slug: string
    descricao: string
    isbn: string
    numero_paginas: number
    publicacao: string
    imagem_capa: string
    sobre: string
    autor: Autor
    categoria: Categoria
    preco: number
    estoque: number
    //criado_em: string
    //atualizado_em: string
}

export interface PaginatedResponse<T> {
    data: T[]
    meta: {
        total: number
        por_pagina: number
        pagina_atual: number
        ultima_pagina: number
    }
}

export interface AuthResponse {
    status: string
    user: User
    authorisation: {
        token: string
        type: string
    }
}

export interface LoginCredentials{
    email: string
    password: string
}

export interface RegisterData{
    name: string
    email: string
    password: string
    password_confirmation: string
}