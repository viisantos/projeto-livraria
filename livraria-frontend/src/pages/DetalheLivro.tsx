import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FaArrowLeft, FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa'
import api from '../api/axios'
import type { Livro } from '../types'
import { useCart } from '../contexts/CartContext'
import { useFavorites } from '../contexts/FavoritesContext'

export function DetalheLivro() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const { addToCart } = useCart()
    const { isFavorito, toggleFavorito } = useFavorites()
    const [livro, setLivro] = useState<Livro | null>(null)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState('')

    useEffect(() => {
        buscarLivro()
    }, [slug])

    async function buscarLivro(): Promise<void> {
        if (!slug) {
            setErro('Livro não encontrado.')
            setCarregando(false)
            return
        }

        setCarregando(true)
        setErro('')

        try {
            const response = await api.get<Livro>(`/catalogo/livros/${slug}`)
            setLivro(response.data)
        } catch (error) {
            console.error('Erro ao buscar detalhes do livro', error)
            setErro('Não foi possível carregar os detalhes do livro.')
        } finally {
            setCarregando(false)
        }
    }

    function formatarPreco(valor: number): string {
        return Number(valor).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        })
    }

    function handleAddToCart(): void {
        if (!livro) return

        addToCart(livro)
        navigate('/carrinho')
    }

    if (carregando) {
        return (
            <div className="d-flex justify-content-center py-5">
                <div className="spinner-border" role="status" />
            </div>
        )
    }

    if (erro || !livro) {
        return (
            <div className="container py-5 text-center">
                <h3 className="mb-3">Livro não encontrado</h3>
                <p className="text-muted">{erro || 'Não foi possível encontrar este livro.'}</p>
                <button className="btn btn-dark mt-2" onClick={() => navigate('/catalogo')}>
                    Voltar ao catálogo
                </button>
            </div>
        )
    }

    const favoritado = isFavorito(livro.id)

    return (
        <div className="container py-5">
            <button className="btn btn-outline-secondary btn-sm mb-4" onClick={() => navigate('/catalogo')}>
                <FaArrowLeft className="me-1" />
                Voltar ao catálogo
            </button>

            <div className="row g-5 align-items-start">
                <div className="col-12 col-md-5 col-lg-4">
                    <img
                        src={livro.imagem_capa}
                        alt={livro.titulo}
                        className="img-fluid shadow-sm w-100"
                        style={{ maxHeight: '620px', objectFit: 'cover' }}
                    />
                </div>

                <div className="col-12 col-md-7 col-lg-8">
                    <div className="d-flex justify-content-between gap-3 align-items-start mb-3">
                        <div>
                            <h1 className="font-serif mb-2">{livro.titulo}</h1>
                            <p className="text-muted mb-1">{livro.autor?.nome}</p>
                            {livro.categoria && (
                                <span className="badge bg-secondary">{livro.categoria.nome}</span>
                            )}
                        </div>

                        <button
                            type="button"
                            className={`btn ${favoritado ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => toggleFavorito(livro)}
                            title={favoritado ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                            {favoritado ? <FaHeart /> : <FaRegHeart />}
                        </button>
                    </div>

                    <p className="lead">{livro.descricao}</p>

                    <div className="border-top border-bottom py-3 my-4">
                        <div className="row g-3">
                            <div className="col-6 col-lg-3">
                                <small className="text-muted d-block">Preço</small>
                                <strong>{formatarPreco(livro.preco)}</strong>
                            </div>
                            <div className="col-6 col-lg-3">
                                <small className="text-muted d-block">Páginas</small>
                                <strong>{livro.numero_paginas}</strong>
                            </div>
                            <div className="col-6 col-lg-3">
                                <small className="text-muted d-block">ISBN</small>
                                <strong>{livro.isbn}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h5>Sobre o livro</h5>
                        <p className="text-muted">{livro.sobre}</p>
                    </div>

                    {livro.autor?.sobre && (
                        <div className="mb-4">
                            <h5>Sobre o autor</h5>
                            <p className="text-muted">{livro.autor.sobre}</p>
                        </div>
                    )}

                    <div className="d-flex flex-column flex-sm-row gap-2">
                        <button
                            className="btn btn-dark px-4"
                            onClick={handleAddToCart}
                        >
                            <FaShoppingCart className="me-2" />
                            Adicionar ao carrinho
                        </button>
                        <button className="btn btn-outline-dark px-4" onClick={() => navigate('/favoritos')}>
                            Ver favoritos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
