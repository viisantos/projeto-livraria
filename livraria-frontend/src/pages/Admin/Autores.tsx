import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import type { Autor, PaginatedResponse } from '../../types'

export default function Autores() {
  const navigate = useNavigate()

  const [autores, setAutores] = useState<Autor[]>([])
  const [carregando, setCarregando] = useState<boolean>(true)
  const [erro, setErro] = useState<string>('')
  const [sucesso, setSucesso] = useState<string>('')

  const [modalExcluir, setModalExcluir] = useState<boolean>(false)
  const [autorExcluir, setAutorExcluir] = useState<Autor | null>(null)
  const [excluindo, setExcluindo] = useState<boolean>(false)

  const[paginaAtual, setPaginaAtual] = useState<number>(1)
  const[ultimaPagina, setUltimaPagina] = useState<number>(1)
  const[total, setTotal] = useState<number>(0)

  useEffect(() => {
    buscarAutores()
  }, [paginaAtual])

  async function buscarAutores(): Promise<void> {
    setCarregando(true)
    setErro('')

    try{
      const response = await api.get<PaginatedResponse<Autor>>('/autores', {
        params: { page: paginaAtual }
      })
      setAutores(response.data.data)
      setUltimaPagina(response.data.meta.ultima_pagina)
      setTotal(response.data.meta.total)
    } catch {
      setErro('Não foi possível carregar os autores')
    }finally{
      setCarregando(false)
    }
  }
  function handleConfirmarExclusao(autor: Autor): void {
    setAutorExcluir(autor)
    setModalExcluir(true)
  }

  function handleCancelarExclusao(): void {
    setModalExcluir(false)
    setAutorExcluir(null)
  }

  async function handleExcluir(): Promise<void> {
    if(!autorExcluir) return
    setExcluindo(true)
    try{
      await api.delete(`/autores/${autorExcluir.id}`)
      setSucesso(`Autor "${autorExcluir.nome}" excluído com sucesso.`)
      setModalExcluir(false)
      setAutorExcluir(null)
      buscarAutores()
      setTimeout(() => setSucesso(''), 3000)
    } catch {
      setErro('Não foi possível excluir o autor.')
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">Autores</h4>
          {!carregando && (
            <small className="text-muted">{total} autor{ total !== 1 ? 'es':''}</small>
          )}
        </div>
        <button className="btn btn-dark" onClick={() => navigate('/admin/autores/novo')}>
          + Novo Autor
        </button>
      </div> 
      { sucesso && <div className="alert alert-success">{sucesso}</div>}
      
      { erro && <div className="alert alert-danger">{erro}</div>}

      { carregando && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border" role="status" />
        </div>
      )}

      {!carregando && autores.length === 0 && (
        <div className="text-center py-5 text-muted">Nenhum autor cadastrado.</div>
      )}

      {!carregando && autores.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Sobre</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {autores.map((autor) => (
                <tr key={autor.id}>
                  <td className="text-muted small">{autor.id}</td>
                  <td>{autor.nome}</td>
                  <td className="text-muted small" style={{
                    maxWidth: '300px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {autor.sobre}
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-dark me-2"
                      onClick={() => navigate(`/admin/autores/${autor.id}/editar`)}>
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleConfirmarExclusao(autor)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
      )}

      { !carregando && ultimaPagina > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${paginaAtual === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPaginaAtual(paginaAtual - 1)}>
                  Anterior
                </button>
              </li>

              {Array.from({ length: ultimaPagina }, (_,i) => i + 1).map((pagina) => (
                <li key={pagina} className={`page-item ${pagina === paginaAtual ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPaginaAtual(pagina)}>
                    {pagina}
                  </button>
                </li>
              ))}

              <li className={`page-item ${paginaAtual === ultimaPagina ? 'disabled' : ''}`}>
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
                <p>Tem certeza que deseja excluir o autor <strong>{autorExcluir?.nome}</strong>?</p>
                <p className="text-muted small mb-0">Essa ação não pode ser desfeita.</p>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-outline-secondary" onClick={handleCancelarExclusao} disabled={excluindo}>
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={handleExcluir} disabled={excluindo}>
                  {excluindo ? <><span className="spinner-border spinner-border-sm me-2" />Excluindo...</> : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}