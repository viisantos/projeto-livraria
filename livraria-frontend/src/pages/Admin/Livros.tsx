import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import type { Livro, PaginatedResponse } from '../../types'

export function Livros() {
  const navigate = useNavigate()

  const [livros, setLivros] = useState<Livro[]>([])
  const [carregando, setCarregando] = useState<boolean>(true)
  const [erro, setErro] = useState<string>('')
  const [sucesso, setSucesso] = useState<string>('')

  const [modalExcluir, setModalExcluir] = useState<boolean>(false)
  const [livroExcluir, setLivroExcluir] = useState<Livro | null>(null)
  const [excluindo, setExcluindo] = useState<boolean>(false)

  const [paginaAtual, setPaginaAtual] = useState<number>(1)
  const [ultimaPagina, setUltimaPagina] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  const effectRodou = useRef(false)

  useEffect(() => {
    if(effectRodou.current === false){
    buscarLivros()}

    return () => {
      effectRodou.current = true
    }
  }, [paginaAtual])
  
  async function buscarLivros(): Promise<void>{
    console.log("entrei em 'buscarlivros'")
    setCarregando(true)
    setErro('')

    try{
      const response = await api.get<PaginatedResponse<Livro>>('/livros', {
        params: { page: paginaAtual }
      })
      console.log(response)
      setLivros(response.data.data)
      setUltimaPagina(response.data.meta.ultima_pagina)
      setTotal(response.data.meta.total)
    } catch {
      setErro('Não foi possível carregar os livros')
    } finally {
      console.log(`Antes de atualizar "carregando"`)
      setCarregando(false)
      console.log(`conteúdo de carregando : ${carregando}`)
    }
  }



  function handleConfirmarExclusao(livro: Livro): void {
    setLivroExcluir(livro)
    setModalExcluir(true)
  }

  function handleCancelarExclusao(): void {
    setModalExcluir(false)
    setLivroExcluir(null)
  }

  async function handleExcluir(): Promise<void>{
    if(!livroExcluir) return
    setExcluindo(true)

    try{
      await api.delete(`/livros/${livroExcluir.id}`)
      setSucesso(`Livro "${livroExcluir.titulo}" excluído com sucesso`)
      setModalExcluir(false)
      setLivroExcluir(null)
      buscarLivros()
      setTimeout(() => setSucesso(''), 3000)
    } catch {
      setErro("Não foi possível excluir o livro")
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <>
      <div className="d-flex justify-content-beetween align-items-center mb-4">
        <div>
          <h4 className="mb-0">Livros</h4>
          { !carregando && (
            <small className="text-muted">{ total } livro{total !== 1 ? 's':''}</small>
          )}
        </div>
        <button className="btn btn-dark" style={{ marginLeft: '86%' }} onClick={() => navigate('/admin/livros/novo')}>
          + Novo Livro
        </button> 
      </div>

      { sucesso && <div className="alert alert-success"> { sucesso } </div> }
      { erro && <div className="alert alert-danger">{ erro }</div> }

      { carregando && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border" role="status" />
        </div>
      )}

      {!carregando && livros.length === 0 && (
        <div className="text-center py-5 text-muted"> Nenhum livro cadastrado. </div>
      )}

      { !carregando && livros.length > 0 && (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Capa</th>
                <th>Título</th>
                <th>Autor</th>
                <th>Categoria</th>
                <th>Páginas</th>
                <th>Publicação</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>   
              {livros.map((livro) => (
                <tr key={livro.id}>
                  <td className="text-muted small">{livro.id}</td>
                  <td>
                    <img src={livro.imagem_capa}
                         alt={livro.titulo}
                         width={40}
                         height={55}
                         style={{ objectFit: 'cover', borderRadius: '4px'}}
                         onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/40x55?text=?'
                         }}
                    />
                  </td>
                  <td>
                    <div className="fw-semibold">{livro.titulo}</div>
                    <small className="text-muted">{livro.isbn}</small>
                  </td>  
                  <td>
                    {livro.autor?.nome ?? '-'}
                  </td>
                  <td>
                    { livro.categoria && (
                      <span className="badge bg-secondary"> {livro.categoria.nome}</span>
                    )}
                  </td>
                  <td className="text-muted small">{ livro.numero_paginas }</td>
                  <td className="text-muted small">{ livro.publicacao }</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-dark me-2" 
                     onClick={() => navigate(`/admin/livros/${livro.id}/editar`)}> 
                      Editar 
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleConfirmarExclusao(livro)}>
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
     
      {modalExcluir && <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} />}
      {modalExcluir && (
        <div className="modal fade show d-block" style={{ zIndex: 1050 }} role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0">
                <h5 className="modal-title">Confirmar exclusão</h5>
              </div>
              <div className="modal-body">
                <p>Tem certeza que deseja excluir o livro <strong>{livroExcluir?.titulo}</strong>?</p>
                <p className="text-muted small mb-0">Essa ação não pode ser desfeita.</p>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-outline-secondary" onClick={handleCancelarExclusao} disabled={excluindo}>
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={handleExcluir} disabled={excluindo}>
                  {excluindo
                    ? <><span className="spinner-border spinner-border-sm me-2" />Excluindo...</>
                    : 'Excluir'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
