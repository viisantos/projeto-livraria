import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Livro } from '../types'

interface CartItem {
    livroId: number
    titulo: string
    price: number 
    quantidade: number
    estoque: number
} 

interface CartContextType {
    cart: CartItem[]
    addToCart: (livro: Livro) => void
    aumentarQuantidade: (livroId: number) => void
    diminuirQuantidade: (livroId: number) => void
    removeFromCart: (livroId: number) => void
    clearCart: () => void
    total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children : ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([])

    function addToCart(livro: Livro){
          setCart(prev => {
            const itemExistente = prev.find(item => item.livroId === livro.id)

            if(itemExistente){
                const novaQuantidade = itemExistente.quantidade + 1
                if(novaQuantidade > livro.estoque){
                    alert('Quantidade indisponível')
                    return prev
                }
                return prev.map(item => item.livroId === livro.id ? { ...item, quantidade: novaQuantidade } : item )
            }

            return [...prev, {
                livroId: livro.id,
                titulo: livro.titulo,
                price: livro.preco,
                quantidade: 1,
                estoque: livro.estoque      
            }]
          })  
    }

    function removeFromCart(livroId: number){
        setCart(prev => prev.filter(item => item.livroId !== livroId))
    }  

    function clearCart(){
        setCart([])
    }

    function aumentarQuantidade(livroId: number){
            setCart(prev => prev.map(item => {
                        if(item.livroId === livroId){
                            const novaQuantidade = item.quantidade + 1
                            if (novaQuantidade > item.estoque) {
                                alert('Quantidade indisponível')
                                return item
                            }
                            return { ...item, quantidade: novaQuantidade }
                        }
                        return item
                    })
            ) /*? {...item, quantidade: item.quantidade + 1} : item)*/ 
        }
    
        function diminuirQuantidade(livroId: number){
            setCart(prev => prev.map(item =>
                            item.livroId === livroId ? {...item, quantidade: item.quantidade - 1} : item).filter(item => item.quantidade > 0) )
        }

    const total = cart.reduce((acc, item) => acc + parseFloat(item.price * item.quantidade), 0)

    return(
        <CartContext.Provider value={{ cart, addToCart, aumentarQuantidade, diminuirQuantidade, removeFromCart, clearCart, total }}>
            {children}
        </CartContext.Provider>
    ) 
}

export function useCart() {
    const context = useContext(CartContext)
    if(!context){
        throw new Error('UseCart deve ser usado dentro de um CartProvider')
    }
    return context
}