import { useNavigate } from 'react-router-dom'
import { FaHeart, FaShoppingCart } from 'react-icons/fa'
import { useCart } from '../contexts/CartContext'
import { useFavorites } from '../contexts/FavoritesContext'
import type { Livro } from '../types'

export function Favoritos() {
    const navigate = useNavigate()
    const { addToCart } = useCart()
    const { favoritos, carregandoFavoritos, removeFavorito } = useFavorites()

    function handleAddToCart(livro: Livro): void {
        addToCart(livro)
        navigate('/carrinho')
    }

    if (carregandoFavoritos) {
        return (
            <div className="d-flex justify-content-center py-5">
                <div className="spinner-border" role="status" />
            </div>
        )
    }

    if (favoritos.length === 0) {
        return (
            <div className="container py-5 text-center">
                <h3 className="mb-3">Você ainda não favoritou nenhum livro</h3>
                <p className="text-muted">Salve livros do catálogo para encontrá-los com facilidade depois.</p>
                <button className="btn btn-dark mt-2" onClick={() => navigate('/catalogo')}>
                    Ver catálogo
                </button>
            </div>
        )
    }

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="font-serif mb-0">Meus Favoritos</h2>
                    <small className="text-muted">
                        {favoritos.length} livro{favoritos.length !== 1 ? 's' : ''} salvo{favoritos.length !== 1 ? 's' : ''}
                    </small>
                </div>
                <button className="btn btn-outline-dark" onClick={() => navigate('/catalogo')}>
                    Continuar explorando
                </button>
            </div>

            <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
                {favoritos.map((livro) => (
                    <div key={livro.id} className="col">
                        <div className="card h-100 border-0 shadow-sm">
                            <img
                                src={livro.imagem_capa}
                                className="card-img-top"
                                alt={livro.titulo}
                                style={{ height: '300px', objectFit: 'cover' }}
                            />
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title font-serif">{livro.titulo}</h5>
                                <p className="text-muted small">{livro.autor?.nome}</p>
                                <small className="text-muted d-block mb-2">Estoque: {livro.estoque}</small>
                                <span className="fw-bold text-dark mb-3">R$ {Number(livro.preco).toFixed(2)}</span>

                                <div className="d-flex gap-2 mt-auto">
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => removeFavorito(livro.id)}
                                        title="Remover dos favoritos"
                                    >
                                        <FaHeart />
                                    </button>
                                    <button
                                        disabled={livro.estoque === 0}
                                        className="btn btn-outline-dark btn-sm flex-fill"
                                        onClick={() => handleAddToCart(livro)}
                                    >
                                        <FaShoppingCart className="me-1" />
                                        {livro.estoque === 0 ? 'Indisponível' : 'Adicionar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
