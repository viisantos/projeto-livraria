import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

import type { Categoria, Livro, PaginatedResponse } from '../types'
import { useCart } from '../contexts/CartContext'
import { useFavorites } from '../contexts/FavoritesContext'
import { FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa'

type CatalogoFiltros = {
  busca: string
  categoriaId: string
  autor: string
  minPreco: string
  maxPreco: string
  perPage: string
  ordenar: string
}

const filtrosIniciais: CatalogoFiltros = {
  busca: '',
  categoriaId: '',
  autor: '',
  minPreco: '',
  maxPreco: '',
  perPage: '12',
  ordenar: '',
}

export function Catalogo() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isFavorito, toggleFavorito } = useFavorites()
  const [livros, setLivros] = useState<Livro[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [ultimaPagina, setUltimaPagina] = useState(1)
  const [total, setTotal] = useState(0)
  const [filtros, setFiltros] = useState<CatalogoFiltros>(filtrosIniciais)
  const [filtrosAplicados, setFiltrosAplicados] = useState<CatalogoFiltros>(filtrosIniciais)

  useEffect(() => {
    buscarCategorias()
  }, [])

  useEffect(() => {
    buscarLivros()
  }, [paginaAtual, filtrosAplicados])

  async function buscarCategorias(): Promise<void> {
    try {
      const response = await api.get<PaginatedResponse<Categoria>>('/catalogo/categorias', {
        params: { per_page: 100 }
      })
      setCategorias(response.data.data)
    } catch (error) {
      console.error('Erro ao buscar categorias', error)
    }
  }

  async function buscarLivros(): Promise<void> {
    setCarregando(true)
    setErro('')

    const params: Record<string, string | number> = {
      page: paginaAtual,
      per_page: filtrosAplicados.perPage,
    }

    if (filtrosAplicados.busca.trim()) {
      params.busca = filtrosAplicados.busca.trim()
    }

    if (filtrosAplicados.categoriaId) {
      params.categoria_id = filtrosAplicados.categoriaId
    }

    if (filtrosAplicados.autor.trim()) {
      params.autor = filtrosAplicados.autor.trim()
    }

    if (filtrosAplicados.minPreco) {
      params.min_preco = filtrosAplicados.minPreco
    }

    if (filtrosAplicados.maxPreco) {
      params.max_preco = filtrosAplicados.maxPreco
    }

    if (filtrosAplicados.ordenar) {
      params.ordenar = filtrosAplicados.ordenar
    }

    try {
      const response = await api.get<PaginatedResponse<Livro>>('/livros', { params })
      setLivros(response.data.data)
      setUltimaPagina(response.data.meta.ultima_pagina)
      setTotal(response.data.meta.total)
    } catch (error) {
      console.error('Erro ao buscar livros', error)
      setErro('Não foi possível carregar os livros.')
    } finally {
      setCarregando(false)
    }
  }

  function handleAplicarFiltros(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    setPaginaAtual(1)
    setFiltrosAplicados(filtros)
  }

  function handleLimparFiltros(): void {
    setFiltros(filtrosIniciais)
    setFiltrosAplicados(filtrosIniciais)
    setPaginaAtual(1)
  }
  
  function handleAddToCart(livro: Livro) {
    addToCart(livro)
    alert('Livro adicionado ao carrinho !')
    navigate('/carrinho')
  }

  function handleToggleFavorito(livro: Livro): void {
    toggleFavorito(livro)
  }

  function handleVerDetalhes(livro: Livro): void {
    navigate(`/livros/${livro.slug}`)
  }

  return (
    <div className="container py-5">
      <h2 className="font-serif mb-4 text-center"> Nossa Coleção </h2>

      <form onSubmit={handleAplicarFiltros} className="mb-4 border rounded p-3 bg-light">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-lg-4">
            <label htmlFor="busca" className="form-label">Busca</label>
            <input
              id="busca"
              className="form-control"
              value={filtros.busca}
              onChange={(event) => setFiltros({ ...filtros, busca: event.target.value })}
              placeholder="Título, descrição, ISBN ou autor"
            />
          </div>

          <div className="col-12 col-md-6 col-lg-2">
            <label htmlFor="categoria" className="form-label">Categoria</label>
            <select
              id="categoria"
              className="form-select"
              value={filtros.categoriaId}
              onChange={(event) => setFiltros({ ...filtros, categoriaId: event.target.value })}
            >
              <option value="">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6 col-lg-2">
            <label htmlFor="autor" className="form-label">Autor</label>
            <input
              id="autor"
              className="form-control"
              value={filtros.autor}
              onChange={(event) => setFiltros({ ...filtros, autor: event.target.value })}
              placeholder="Nome do autor"
            />
          </div>

          <div className="col-6 col-md-3 col-lg-1">
            <label htmlFor="min_preco" className="form-label">Preço min.</label>
            <input
              id="min_preco"
              type="number"
              min="0"
              step="0.01"
              className="form-control"
              value={filtros.minPreco}
              onChange={(event) => setFiltros({ ...filtros, minPreco: event.target.value })}
            />
          </div>

          <div className="col-6 col-md-3 col-lg-1">
            <label htmlFor="max_preco" className="form-label">Preço max.</label>
            <input
              id="max_preco"
              type="number"
              min="0"
              step="0.01"
              className="form-control"
              value={filtros.maxPreco}
              onChange={(event) => setFiltros({ ...filtros, maxPreco: event.target.value })}
            />
          </div>

          <div className="col-12 col-md-3 col-lg-2">
            <label htmlFor="ordenar" className="form-label">Ordenar</label>
            <select
              id="ordenar"
              className="form-select"
              value={filtros.ordenar}
              onChange={(event) => setFiltros({ ...filtros, ordenar: event.target.value })}
            >
              <option value="">Mais recentes</option>
              <option value="titulo_az">Título A-Z</option>
              <option value="titulo_za">Título Z-A</option>
              <option value="preco_menor">Menor preço</option>
              <option value="preco_maior">Maior preço</option>
              <option value="mais_antigos">Mais antigos</option>
            </select>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <label htmlFor="per_page" className="form-label">Itens por página</label>
            <select
              id="per_page"
              className="form-select"
              value={filtros.perPage}
              onChange={(event) => setFiltros({ ...filtros, perPage: event.target.value })}
            >
              <option value="8">8</option>
              <option value="12">12</option>
              <option value="16">16</option>
              <option value="24">24</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="col-12 col-md-6 col-lg-4 d-flex gap-2">
            <button type="submit" className="btn btn-dark flex-fill">Aplicar filtros</button>
            <button type="button" className="btn btn-outline-secondary flex-fill" onClick={handleLimparFiltros}>
              Limpar
            </button>
          </div>
        </div>
      </form>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <small className="text-muted">{total} livro{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</small>
        {carregando && <span className="spinner-border spinner-border-sm" role="status" />}
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {!carregando && livros.length === 0 && (
        <div className="text-center py-5 text-muted">Nenhum livro encontrado com esses filtros.</div>
      )}

      {livros.length > 0 && (
        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
          {livros.map((livro) => (
            <div key={livro.id} className="col">
              <div className="card h-100 border-0 shadow-sm hover-shadow transition position-relative">
                <button
                  type="button"
                  className={`btn btn-sm position-absolute top-0 end-0 m-2 ${isFavorito(livro.id) ? 'btn-danger' : 'btn-light'}`}
                  onClick={() => handleToggleFavorito(livro)}
                  title={isFavorito(livro.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  aria-label={isFavorito(livro.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  style={{ zIndex: 1 }}
                >
                  {isFavorito(livro.id) ? <FaHeart /> : <FaRegHeart />}
                </button>
                <img
                  src={livro.imagem_capa}
                  className="card-img-top"
                  alt={livro.titulo}
                  style={{ height: '300px', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => handleVerDetalhes(livro)}
                />
                <div className="card-body">
                  <button
                    type="button"
                    className="btn btn-link p-0 text-start text-dark text-decoration-none"
                    onClick={() => handleVerDetalhes(livro)}
                  >
                    <h5 className="card-title font-serif">{livro.titulo}</h5>
                  </button>
                  <p className="text-muted small">{livro.autor?.nome}</p>
                  <div className="d-flex justify-content-between align-items-center gap-2">
                    <span className="fw-bold text-dark"> R$ {Number(livro.preco).toFixed(2)} </span>
                    <button className="btn btn-outline-dark btn-sm" onClick={() => handleAddToCart(livro)}>
                      <FaShoppingCart className="me-1" />
                      Adicionar ao Carrinho
                    </button>
                  </div>
                  <button className="btn btn-link btn-sm p-0 mt-3 text-dark" onClick={() => handleVerDetalhes(livro)}>
                    Ver detalhes
                  </button>
                </div>
              </div>  
            </div>
          ))}
        </div>
      )}

      {!carregando && ultimaPagina > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${paginaAtual === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPaginaAtual(paginaAtual - 1)}>Anterior</button>
              </li>
              {Array.from({ length: ultimaPagina }, (_, i) => i + 1).map((pagina) => (
                <li key={pagina} className={`page-item ${pagina === paginaAtual ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPaginaAtual(pagina)}>{pagina}</button>
                </li>
              ))}
              <li className={`page-item ${paginaAtual === ultimaPagina ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPaginaAtual(paginaAtual + 1)}>Próxima</button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  )
}
