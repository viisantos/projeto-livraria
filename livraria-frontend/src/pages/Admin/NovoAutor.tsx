import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'

interface NovoAutorData {
  nome: string
  sobre: string
}

export function NovoAutor() {
  const navigate = useNavigate()
  const [dados, setDados] = useState<NovoAutorData>({
    nome: '',
    sobre: '',
  })
  const [erros, setErros] = useState<Record<string, string[]>>({})
  const [carregando, setCarregando] = useState<boolean>(false)
  const [modalAberta, setModalAberta] = useState<boolean>(false)
  const [erroGeral, setErroGeral] = useState('')

  useEffect(() => {
    if (!carregando) setModalAberta(false)
  }, [carregando])
  
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    setDados({...dados, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void>{
    e.preventDefault()
    setErros({})
    setErroGeral('')
    setCarregando(true)

    try{
      await api.post('/autores', dados)
      navigate('/admin/autores')
    } catch(error: any) {
      if(error.response?.status === 422 ){
        setErros(error.response.data.errors)
      } else {
        setErroGeral('Não foi possível cadastrar o autor. Tente novamente.')
      }
    } finally {
      setCarregando(false)
    }
  }

  function erroDoCampo(campo: string): string {
    return erros[campo]?.[0] ?? ''
  }

  return (
    <>  
    <div className="row justify-content-center">
      <div className="col-12 col-md-7 col-lg-6">
        <div className="d-flex align-items-center gap-3 mb-4">
          <Link to="/admin/autores" className="btn btn-outline-secondary btn-sm"> 
            ← Voltar   
          </Link>
          <h4 className="mb-0"> Novo autor </h4>
        </div>

        <div className="card shadow-sm">
          <div className="card-body p-4">
            {erroGeral && <div className="alert alert-danger">{erroGeral}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                  <label htmlFor="nome" className="form-label">Nome</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    className={`form-control ${erroDoCampo('nome') ? 'is-invalid' : ''}`}
                    value={dados.nome}
                    onChange={handleChange}
                    placeholder="Nome completo do autor"
                    required
                  />
                  {erroDoCampo('nome') && (
                  <div className="invalid-feedback">{erroDoCampo('nome')}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="sobre" className="form-label">Sobre</label>
                <textarea
                  id="sobre"
                  name="sobre"
                  className={`form-control ${erroDoCampo('sobre') ? 'is-invalid' : ''}`}
                  value={dados.sobre}
                  onChange={handleChange}
                  placeholder="Biografia ou descrição do autor"
                  rows={5}
                  required
                />
                {erroDoCampo('sobre') && (
                  <div className="invalid-feedback">{erroDoCampo('sobre')}</div>
                )}
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-dark flex-grow-1" disabled={carregando}>
                  {carregando ? <><span className="spinner-border spinner-border-sm me-2" /> Salvando... </> : 'Salvar'}
                </button>
                <Link to="/admin/autores" className="btn btn-outline-secondary"> Cancelar </Link>                 
              </div>
            </form>
          </div>
        </div> 
      </div>  
    </div>

    { modalAberta && (
        <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} />
        )}

        { modalAberta && (
        <div className="modal fade show d-block" style={{ zIndex: 1050 }} role="dialog">
            <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
                <div className="modal-header border-0 pb-0">
                <h5 className="modal-title"> Cadastro de novo autor realizado 🎉</h5>
                </div>

                <div className="modal-body">
                <p>
                    Cadastro de autor Efetuado com sucesso!
                </p>
                <Link to="/admin/autores" className="btn btn-outline-secondary"> Retornar </Link>
                </div>
            </div>
            </div>
        </div>
        )}
    </>
  )
}
