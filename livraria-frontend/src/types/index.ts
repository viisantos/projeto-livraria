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
    //criado_em: string
    //atualizado_em: string
}

export interface PedidoItem {
    livro_id: number
    titulo: string
    imagem_capa: string
    preco: number | string
    subtotal: number | string
}

export type PedidoStatus = 'pendente' | 'pago' | 'falha'

export interface Pedido {
    id: number
    status: PedidoStatus
    total: number | string
    created_at: string
    itens: PedidoItem[]
}

export interface BibliotecaLivro {
    id: number
    titulo: string
    imagem_capa: string
    formato_ebook: 'pdf' | 'epub' | null
    leitura_disponivel: boolean
    endpoint_leitura?: string
    adquirido_em: string
    autor: Autor
}

export interface BibliotecaResponse {
    data: BibliotecaLivro[]
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
