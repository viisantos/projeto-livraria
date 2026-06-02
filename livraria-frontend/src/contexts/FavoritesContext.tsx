import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import api from '../api/axios'
import type { Livro, PaginatedResponse } from '../types'
import { useAuth } from '../hooks/useAuth'

interface FavoritesContextType {
    favoritos: Livro[]
    favoritosIds: number[]
    carregandoFavoritos: boolean
    isFavorito: (livroId: number) => boolean
    carregarFavoritos: () => Promise<void>
    toggleFavorito: (livro: Livro) => Promise<void>
    removeFavorito: (livroId: number) => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const { autenticado } = useAuth()
    const [favoritos, setFavoritos] = useState<Livro[]>([])
    const [carregandoFavoritos, setCarregandoFavoritos] = useState(false)

    const favoritosIds = useMemo(() => favoritos.map((livro) => livro.id), [favoritos])

    useEffect(() => {
        if (autenticado) {
            carregarFavoritos()
            return
        }

        setFavoritos([])
    }, [autenticado])

    function isFavorito(livroId: number): boolean {
        return favoritosIds.includes(livroId)
    }

    async function carregarFavoritos(): Promise<void> {
        setCarregandoFavoritos(true)

        try {
            const response = await api.get<PaginatedResponse<Livro>>('/me/favoritos', {
                params: { per_page: 50 }
            })
            setFavoritos(response.data.data)
        } catch (error) {
            console.error('Erro ao carregar favoritos', error)
        } finally {
            setCarregandoFavoritos(false)
        }
    }

    async function toggleFavorito(livro: Livro): Promise<void> {
        if (isFavorito(livro.id)) {
            await removeFavorito(livro.id)
            return
        }

        setFavoritos((favoritosAtuais) => [...favoritosAtuais, livro])

        try {
            const response = await api.post<{ favorito: boolean; livro: Livro }>(`/livros/${livro.id}/favoritar`)
            if (response.data.livro) {
                setFavoritos((favoritosAtuais) =>
                    favoritosAtuais.map((favorito) => favorito.id === livro.id ? response.data.livro : favorito)
                )
            }
        } catch (error) {
            console.error('Erro ao favoritar livro', error)
            setFavoritos((favoritosAtuais) => favoritosAtuais.filter((favorito) => favorito.id !== livro.id))
        }
    }

    async function removeFavorito(livroId: number): Promise<void> {
        const favoritosAnteriores = favoritos
        setFavoritos((favoritosAtuais) => favoritosAtuais.filter((livro) => livro.id !== livroId))

        try {
            await api.delete(`/livros/${livroId}/favoritar`)
        } catch (error) {
            console.error('Erro ao remover favorito', error)
            setFavoritos(favoritosAnteriores)
        }
    }

    return (
        <FavoritesContext.Provider value={{
            favoritos,
            favoritosIds,
            carregandoFavoritos,
            isFavorito,
            carregarFavoritos,
            toggleFavorito,
            removeFavorito
        }}>
            {children}
        </FavoritesContext.Provider>
    )
}

export function useFavorites() {
    const context = useContext(FavoritesContext)

    if (!context) {
        throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider')
    }

    return context
}
