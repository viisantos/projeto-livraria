import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Livro } from '../types'

interface CartItem { livroId: number; titulo: string; price: number }
interface CartContextType {
    cart: CartItem[]
    addToCart: (livro: Livro) => void
    removeFromCart: (livroId: number) => void
    clearCart: () => void
    total: number
}
const CartContext = createContext<CartContextType | undefined>(undefined)
export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([])
    function addToCart(livro: Livro) {
        setCart((atual) => atual.some((item) => item.livroId === livro.id) ? atual : [...atual, { livroId: livro.id, titulo: livro.titulo, price: livro.preco }])
    }
    function removeFromCart(livroId: number) { setCart((atual) => atual.filter((item) => item.livroId !== livroId)) }
    function clearCart() { setCart([]) }
    const total = cart.reduce((acumulado, item) => acumulado + Number(item.price), 0)
    return <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>{children}</CartContext.Provider>
}
export function useCart() {
    const context = useContext(CartContext)
    if (!context) throw new Error('useCart deve ser usado dentro de um CartProvider')
    return context
}
