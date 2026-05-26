import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'

interface NovaCategoriaData {
  nome: string
  slug: string
}

export function NovaCategoria() {
  const navigate = useNavigate()
  const [dados, setDados] = useState<NovaCategoriaData>({nome:'', slug:''})
  const [erros, setErros] = useState<Record<string, string[]>>({})
  const [carregando, setCarregando] = useState<boolean>(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target

    if(name === 'nome'){
      setDados({
        nome: value,
        slug: value.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g,'')
              .replace(/[^a-z0-9\s-]/g, '')
              .trim()
              .replace(/\s+/g,'-'), 
      })
    } else {
      setDados({ ...dados, [name]: value })
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void>{
    e.preventDefault()
    setErros({})
    setCarregando(true)

    try{
      await api.post('/categorias', dados)
      navigate('/admin/categorias')
    } catch (error: any){
      if(error.response?.status === 422){
        setErros(error.response.data.errors)
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
        <div className="col-12 col-md-7 col-lg-5">
          <div className="d-flex align-items-center gap-3 mb-4">
            <Link to="/admin/categorias" className="btn btn-outline-secondary btn-sm">
              ← Voltar
            </Link>
            <h4 className="mb-0">Nova Categoria</h4>
          </div>

          <div className="card shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nome" className="form-label"> Nome </label>
                  <input type="text"
                         id="nome"
                         name="nome"
                         className={`form-control ${erroDoCampo('nome') ? 'is-invalid':''}`}
                         value={dados.nome}
                         onChange={handleChange}
                         placeholder="Ex.: tecnologia"
                         required />
                  { erroDoCampo('nome') && <div className="invalid-feedback">{ erroDoCampo('nome') }</div>}
                </div>

                <div className="mb-4"> 
                  <label htmlFor="slug" className="form-label">
                    Slug
                  <small className="text-muted ms-2"> gerado automaticamente </small>
                  </label>

                  <input type="text"
                         id="slug"
                         name="slug"
                         className={`form-control ${erroDoCampo('slug') ? 'is-invalid':''}`}
                         value={dados.slug}
                         onChange={handleChange}
                         placeholder="ex: tecnologia" />
                  { erroDoCampo('slug') && <div className="invalid-feedback">{ erroDoCampo('slug') }</div> }
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-dark flex-grow-1" disabled={carregando}>
                    { carregando ? <><span className="spinner-border spinner-border-sm me-2" /> Salvando... </> :  'Salvar'}
                  </button>
                  <Link to="/admin/categorias" className="btn btn-outline-secondary"> Cancelar </Link>
                </div>
              </form>
            </div> 
          </div>
        </div>
      </div>   
    </>
  )
}