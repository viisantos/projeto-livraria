import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

import type { Livro, PaginatedResponse } from '../types' 
import { useCart } from '../contexts/CartContext'

export function Catalogo() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [livros, setLivros] = useState<Livro[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect (() => {
    buscarLivros()
  }, [])

  async function buscarLivros(){
    try{
      const response = await api.get<PaginatedResponse<Livro>>('/livros')
      setLivros(response.data.data)
      console.log(response.data.data)
    } catch(error){
      console.error("Erro ao buscar livros ", error)
    } finally {
      setCarregando(false)
    }
  }
  
  function handleAddToCart(livro: Livro){
    addToCart(livro)
    alert('Livro adicionado ao carrinho !')
    navigate('/carrinho')
  }

  if (carregando) {
    return <p className="text-center mt-5">Carregando livros...</p>
  }
  return (<>
    <div className="container py-5">
     
      <h2 className="font-serif mb-5 text-center"> Nossa Coleção </h2>

      <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
        { livros.map((livro) => (
          <div key={livro.id} className="col">
            <div className="card h-100 border-0 shadow-sm hover-shadow transition">
              <img src={ livro.imagem_capa } className="card-img-top" alt={ livro.titulo } style={{ height: '300px', objectFit: 'cover' }} />
              <div className="card-body">
                <h5 className="card-title font-serif">{ livro.titulo }</h5>
                <p className="text-muted small">{ livro.autor?.nome }</p>
                <small className="text-muted d-block mb-2">
                    Estoque: {livro.estoque}
                </small>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold text-dark"> R$ { livro.preco } </span>
                  <button disabled={livro.estoque === 0} className="btn btn-outline-dark btn-sm" onClick={() => handleAddToCart(livro)} > {livro.estoque === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}  </button>
                </div>
              </div>
            </div>  
          </div>
        ))}
      </div>
    </div>
  </>)
}