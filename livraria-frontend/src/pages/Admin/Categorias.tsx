import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import type { Categoria, PaginatedResponse } from '../../types'

export default function Categorias() {
  const navigate = useNavigate()

  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [carregando, setCarregando] = useState<boolean>(true)
  const [erro, setErro] = useState<string>('')
  const [sucesso, setSucesso] = useState<string>('')

  const [modalExcluir, setModalExcluir] = useState<boolean>(false)
  const [categoriaExcluir, setCategoriaExcluir] = useState<Categoria | null>(null)
  const [excluindo, setExcluindo] = useState<boolean>(false)

  const [paginaAtual, setPaginaAtual] = useState<number>(1)
  const [ultimaPagina, setUltimaPagina] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    buscarCategorias()
  }, [paginaAtual])

  async function buscarCategorias(): Promise<void> {
    setCarregando(true)
    setErro('')

    try {
      const response = await api.get<PaginatedResponse<Categoria>>('/categorias', {
        params: { page: paginaAtual }
      })
      setCategorias(response.data.data)
      setUltimaPagina(response.data.meta.ultima_pagina)
      setTotal(response.data.meta.total)
    } catch {
      setErro('Não foi possível carregar as categorias')
    } finally {
      setCarregando(false)
    }
  }

  function handleConfirmarExclusao(categoria: Categoria): void {
    setCategoriaExcluir(categoria)
    setModalExcluir(true)
  }

  function handleCancelarExclusao(): void {
    setModalExcluir(false)
    setCategoriaExcluir(null)
  }

  async function handleExcluir(): Promise<void>{
    if(!categoriaExcluir) return 
    setExcluindo(true)

    try{
      await api.delete(`/categorias/${categoriaExcluir.id}`)
      setSucesso(`Categoria "${categoriaExcluir.nome}" excluída com sucesso.`)
      setModalExcluir(false)
      setCategoriaExcluir(null)
      buscarCategorias()
      setTimeout(() => setSucesso(''), 3000)
    } catch {
      setErro('Não foi possível excluir a categoria')
    } finally {
      setExcluindo(false)
    }
  }
  return (<>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 className="mb-0"> Categorias </h4>
        {!carregando && (
          <small className="text-muted">{ total } categoria{ total !== 1 ? 's':''} </small>
        )}
      </div>
      <button className="btn btn-dark" onClick={() => navigate('/admin/categorias/nova')}>
        + Nova categoria
      </button>  
    </div>

    {sucesso && <div className="alert alert-success">{sucesso}</div>}
    {erro && <div className="alert alert-danger">{erro}</div>}

    {carregando && (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" role="status" />
      </div>  
    )}

    {!carregando && categorias.length === 0 && (
      <div className="text-center py-5 text-muted">
        Nenhuma categoria cadastrada. 
      </div>
    )}

    {!carregando && categorias.length > 0 && (
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>Slug</th>              
              <th className="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id}>
                <td className="text-muted small">{categoria.id}</td>
                <td>{categoria.nome}</td>
                <td><span className="badge bg-secondary">{categoria.slug}</span></td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-dark me-2"
                  onClick={() => navigate(`/admin/categorias/${categoria.id}/editar`)}>
                    Editar
                  </button>

                  <button className="btn btn-sm btn-outline-danger" 
                  onClick={() => handleConfirmarExclusao(categoria)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>  
        </table>
      </div>
    )}

    {!carregando && ultimaPagina > 1 && (
      <div className="d-flex justify-content-center mt-4">
        <nav>
          <ul className="pagination">
            <li className={`page-item ${paginaAtual === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPaginaAtual(paginaAtual - 1)}> Anterior </button>
            </li>

            {Array.from({ length: ultimaPagina }, (_, i) => i + 1).map((pagina) => (
              <li key={pagina} className={`page-item ${pagina === paginaAtual ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPaginaAtual(pagina)}>
                  {pagina}
                </button>
              </li>
            ))}

            <li className={`page-item ${paginaAtual === ultimaPagina ? 'disabled':''}`}>
              <button className="page-link" onClick={() => setPaginaAtual(paginaAtual + 1)}>
                Próxima
              </button> 
            </li>
          </ul>
        </nav>
      </div>
    )}

    {modalExcluir && <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} />}
    {modalExcluir && (
      <div className="modal fade show d-block" style={{ zIndex: 1050 }} role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">Confirmar exclusão</h5>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja excluir a categoria <strong>{categoriaExcluir?.nome}</strong>?</p>
              <p className="text-muted small mb-0">Essa ação não pode ser desfeita.</p>
            </div>
            <div className="modal-footer border-0">
              <button className="btn btn-outline-secondary" onClick={handleCancelarExclusao} disabled={excluindo}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleExcluir} disabled={excluindo}>
                {excluindo ? <><span className="spinner-border spinner-border-sm me-2" />Excluindo...</> : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

  </>)
}