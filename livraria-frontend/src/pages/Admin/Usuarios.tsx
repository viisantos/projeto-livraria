import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import type { User, PaginatedResponse } from '../../types'

export default function Usuarios() {
  const navigate = useNavigate()

  const [usuarios, setUsuarios] = useState<User[]>([])
  const [carregando, setCarregando] = useState<boolean>(true)
  const [erro, setErro] = useState<string>('')

  const [modalExcluir, setModalExcluir] = useState<boolean>(false)
  const [usuarioExcluir, setUsuarioExcluir] = useState<User | null>(null)
  const [excluindo, setExcluindo] = useState<boolean>(false)
  const [sucesso, setSucesso] = useState<string>('')

  const [paginaAtual, setPaginaAtual] = useState<number>(1)
  const [ultimaPagina, setUltimaPagina] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    buscarUsuarios()
  }, [paginaAtual])

  async function buscarUsuarios(): Promise<void> {
    setCarregando(true)
    setErro('')
  
  try{
    const response = await api.get<PaginatedResponse<User>>('/usuarios',{
      params: {page: paginaAtual }
    })
    console.log("usuarios : ", response)
    setUsuarios(response.data.data)
    setUltimaPagina(response.data.meta.ultima_pagina)
    setTotal(response.data.meta.total)
  }catch{
    setErro('Não foi possível carregar os usuários')
  }finally{
    setCarregando(false)
  }
}

  function handleEditar(id: number): void {
    navigate(`/admin/usuarios/${id}/editar`)
  }

  function handleConfirmarExclusao(usuario: User): void {
    setUsuarioExcluir(usuario)
    setModalExcluir(true)
  }

  function handleCancelarExclusao(): void {
    setModalExcluir(false)
    setUsuarioExcluir(null)
  }
  
  async function handleExcluir(): Promise<void> {
    if(!usuarioExcluir) return 
    setExcluindo(true)

    try{
      await api.delete(`/usuarios/${usuarioExcluir.id}`)
      setSucesso(`Usuario "${usuarioExcluir.name}" excluído com sucesso.`)
      setModalExcluir(false) 
      setUsuarioExcluir(null) 
      buscarUsuarios()
      setTimeout(() => setSucesso(''), 3000)
    }catch{
      setErro('Não foi possível excluir o usuário.')
    } finally {
      setExcluindo(false)
    }
  }
     
    function badgePerfil(perfil: string){
      return perfil === 'admin' ? 
        <span className="badge bg-dark"> Admin </span>
       :<span className="badge bg-secondary">Comprador</span>
    }

    return (
      <>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="mb-0"> Usuarios </h4>
            {!carregando && (<small className="text-muted">{total} usuário{total !== 1 ? 's' : ''}</small>)}
          </div>
          <button className="btn btn-dark" onClick={() => navigate('/admin/usuarios/novo')}>
            + Novo usuario
          </button>
        </div>

        {sucesso && (<div className="alert alert-success">{sucesso}</div>)}

        {erro && (<div className="alert alert-danger">{erro}</div>)}

        {carregando && (<div className="d-flex justify-content-center py-5">
          <div className="spinner-border" role="status" />
        </div>)}

        {!carregando && usuarios.length === 0 && (
          <div className="text-center py-5 text-muted">
            Nenhum usuário encontrado.
          </div>
        )}

        {!carregando && usuarios.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="text-muted small">{usuario.id}</td>
                    <td>{usuario.name}</td>
                    <td>{usuario.email}</td>
                    <td>{badgePerfil(usuario.perfil)}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-dark me-2"
                        onClick={() => handleEditar(usuario.id)}>
                          Editar
                      </button>
                      <button className="btn btn-sm btn-outline-danger me-2"
                        onClick={() => handleConfirmarExclusao(usuario)}>
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
                <li className={`page-item ${paginaAtual === 1 ? 'disabled':''}`}>
                  <button className="page-link" onClick={() => setPaginaAtual(paginaAtual - 1)}>
                    Anterior
                  </button>
                </li>
                {Array.from({length: ultimaPagina}, (_,i) => i + 1).map((pagina) => (
                  <li key={pagina} className={`page-item ${pagina === paginaAtual ? 'active':''}`}>
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

        {modalExcluir && (
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} />
        )}

        {modalExcluir && (
          <div className="modal fade show d-block" style={{ zIndex: 1050 }} role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header border-0">
                  <h5 className="modal-title">
                    Confirmar Exclusão 
                  </h5>
                </div>
                <div className="modal-body">
                  <p>
                    Tem certeza de que deseja excluir o usuário{' '}
                    <strong>{usuarioExcluir?.name}</strong>? 
                  </p>
                  <p className="text-muted small mb-0">
                    Essa ação não pode ser desfeita. 
                  </p>
                </div>
                <div className="modal-footer border-0">
                  <button className="btn btn-outline-secondary" onClick={handleCancelarExclusao} disabled={excluindo} >
                    Cancelar
                  </button>
                  <button className="btn btn-danger" onClick={handleExcluir} disabled={excluindo}>
                    { excluindo ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Excluindo...
                      </>
                    ) : 'Excluir' }
                  </button>
                </div>
              </div>
            </div> 
          </div>
        )}
      </>
    ) 
  }
  

