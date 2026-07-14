import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import api from '../api/axios'
import { useAuth } from '../hooks/useAuth'
import type { Livro } from '../types'

const LEGACY_CART_STORAGE_KEY = 'livraria:carrinho'
const USER_CART_STORAGE_PREFIX = 'livraria:carrinho:usuario'

interface CartItem {
    livroId: number
    titulo: string
    price: number
}

interface CarrinhoResponse {
    data: Livro[]
    total_itens: number
    subtotal: number | string
}

interface CartContextType {
    cart: CartItem[]
    addToCart: (livro: Livro) => void
    removeFromCart: (livroId: number) => void
    clearCart: () => void
    total: number
    sincronizando: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function livroParaCartItem(livro: Livro): CartItem {
    return {
        livroId: livro.id,
        titulo: livro.titulo,
        price: Number(livro.preco),
    }
}

function chaveCarrinhoUsuario(userId: number): string {
    return `${USER_CART_STORAGE_PREFIX}:${userId}`
}

function carregarCarrinhoLocal(chave: string): CartItem[] {
    try {
        const carrinhoSalvo = localStorage.getItem(chave)
        if (!carrinhoSalvo) return []

        const itens = JSON.parse(carrinhoSalvo) as CartItem[]

        return Array.isArray(itens)
            ? itens.filter((item) => item.livroId && item.titulo && Number.isFinite(Number(item.price)))
            : []
    } catch {
        return []
    }
}

function aplicarRespostaCarrinho(response: CarrinhoResponse): CartItem[] {
    return response.data.map(livroParaCartItem)
}

export function CartProvider({ children }: { children: ReactNode }) {
    const { autenticado, token, loading, user } = useAuth()
    const [cart, setCart] = useState<CartItem[]>([])
    const [sincronizando, setSincronizando] = useState(false)
    const cartRef = useRef(cart)
    const sincronizacaoRef = useRef<string | null>(null)

    useEffect(() => {
        cartRef.current = cart

        if (autenticado && user?.id) {
            localStorage.setItem(chaveCarrinhoUsuario(user.id), JSON.stringify(cart))
        }
    }, [autenticado, cart, user?.id])

    useEffect(() => {
        if (loading) return

        localStorage.removeItem(LEGACY_CART_STORAGE_KEY)

        if (!autenticado || !token || !user?.id) {
            sincronizacaoRef.current = null
            setCart([])
            return
        }

        const chaveLocal = chaveCarrinhoUsuario(user.id)
        const chaveSincronizacao = `${user.id}:${token}`

        if (sincronizacaoRef.current === chaveSincronizacao) return

        const carrinhoLocalDoUsuario = carregarCarrinhoLocal(chaveLocal)
        setCart(carrinhoLocalDoUsuario)
        cartRef.current = carrinhoLocalDoUsuario

        let cancelado = false
        sincronizacaoRef.current = chaveSincronizacao
        setSincronizando(true)

        api.post<CarrinhoResponse>('/me/carrinho/sincronizar', { livros: carrinhoLocalDoUsuario })
            .then((response) => {
                if (!cancelado) setCart(aplicarRespostaCarrinho(response.data))
            })
            .catch((error) => {
                console.error('Erro ao sincronizar carrinho', error)
            })
            .finally(() => {
                if (!cancelado) setSincronizando(false)
            })

        return () => {
            cancelado = true
        }
    }, [autenticado, loading, token, user?.id])

    function addToCart(livro: Livro): void {
        setCart((atual) =>
            atual.some((item) => item.livroId === livro.id)
                ? atual
                : [...atual, livroParaCartItem(livro)]
        )

        if (!token) return

        api.post<CarrinhoResponse>(`/livros/${livro.id}/carrinho`)
            .then((response) => setCart(aplicarRespostaCarrinho(response.data)))
            .catch((error) => console.error('Erro ao persistir item no carrinho', error))
    }

    function removeFromCart(livroId: number): void {
        setCart((atual) => atual.filter((item) => item.livroId !== livroId))

        if (!token) return

        api.delete<CarrinhoResponse>(`/livros/${livroId}/carrinho`)
            .then((response) => setCart(aplicarRespostaCarrinho(response.data)))
            .catch((error) => console.error('Erro ao remover item do carrinho', error))
    }

    function clearCart(): void {
        setCart([])

        if (!token) return

        api.delete<CarrinhoResponse>('/me/carrinho')
            .then((response) => setCart(aplicarRespostaCarrinho(response.data)))
            .catch((error) => console.error('Erro ao limpar carrinho persistido', error))
    }

    const total = useMemo(
        () => cart.reduce((acumulado, item) => acumulado + Number(item.price), 0),
        [cart]
    )

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total, sincronizando }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) throw new Error('useCart deve ser usado dentro de um CartProvider')
    return context
}
