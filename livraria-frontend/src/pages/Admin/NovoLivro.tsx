import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'

import { PaginatedEntitySelect } from '../../components/PaginatedEntitySelect'

interface NovoLivroData {
  titulo: string
  slug: string
  descricao: string
  isbn: string
  numero_paginas: string
  publicacao: string
  imagem_capa: string
  sobre: string
  autor_id: string
  categoria_id: string
  preco: string
}

export function NovoLivro() {
  const navigate = useNavigate()
  const [dados, setDados] = useState<NovoLivroData>({
    titulo: '',
    slug: '',
    descricao: '',
    isbn: '',
    numero_paginas: '',
    publicacao: '',
    imagem_capa: '',
    sobre: '',
    autor_id:'',
    categoria_id:'',
    preco: ''
  }) 

  const [erros, setErros] = useState<Record<string, string[]>>({})
  const [carregando, setCarregando] = useState<boolean>(false)
  const [ebook, setEbook] = useState<File | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void {
    const { name, value } = e.target

    if(name === 'titulo'){
      setDados({
        ...dados, 
        titulo: value,
        slug: value.toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-z0-9\s-]/g, '')
                  .trim()
                  .replace(/\s+/g, '-')
      })
    } else {
      setDados({ ...dados, [name]: value})
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setErros({})
    setCarregando(true)

    try{
      const formData = new FormData()
      Object.entries(dados).forEach(([campo, valor]) => formData.append(campo, valor))
      formData.set('preco', dados.preco.replace(',', '.'))
      if (ebook) formData.append('ebook', ebook)
      await api.post('/livros', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

      navigate('/admin/livros')
    } catch (error: any) {
      if(error.response?.status === 422){
        setErros(error.response.data.errors)
      }
    } finally {
      setCarregando(false)
    }
  }

  function erroDocampo(campo: string): string {
    return erros[campo]?.[0] ?? ''
  }
  return (
    <>
    <div className="row justify-content-center"> 
      <div className="col-12 col-md-10 col-lg-8">
        <div className="d-flex align-items-center gap-3 mb-4">
           <Link to="/admin/livros" className="btn btn-outline-secondary btn-sm">
             ← Voltar
           </Link>
           <h4 className="mb-0"> Novo Livro </h4>
        </div>

        <div className="card shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="titulo" className="form-label"> Título </label>
                  <input type="text" id="titulo" name="titulo" className={`form-control ${erroDocampo('titulo') ? 'is-invalid' : ''}`}
                   value={dados.titulo} onChange={handleChange} placeholder="Título do livro" required />
                   
                   { erroDocampo('titulo') && <div className="invalid-feedback">{ erroDocampo('titulo') } </div> }
                </div>

                <div className="col-md-6">
                  <label htmlFor="slug" className="form-label">
                    Slug <small className="text-muted">gerado automaticamente</small>
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    className={`form-control ${erroDocampo('slug') ? 'is-invalid' : ''}`}
                    value={dados.slug}
                    onChange={handleChange}
                  />
                  {erroDocampo('slug') && <div className="invalid-feedback">{erroDocampo('slug')}</div>}
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="ebook" className="form-label">Arquivo do ebook</label>
                <input type="file" id="ebook" name="ebook" accept=".pdf,.epub,application/pdf,application/epub+zip" className="form-control" onChange={(e) => setEbook(e.target.files?.[0] ?? null)} />
                <small className="text-muted">PDF ou EPUB, até 50 MB.</small>
                {ebook && <div className="form-text">{ebook.name}</div>}
                {erroDocampo('ebook') && <div className="text-danger small">{erroDocampo('ebook')}</div>}
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <PaginatedEntitySelect endpoint="/autores" id="autor_id" label="Autor" name="autor_id" value={dados.autor_id} onChange={(value) => setDados({ ...dados, autor_id: value })} error={erroDocampo('autor_id')} />
                </div>
                
                <div className="col-md-6">
                  <PaginatedEntitySelect endpoint="/categorias" id="categoria_id" label="Categoria" name="categoria_id" value={dados.categoria_id} onChange={(value) => setDados({ ...dados, categoria_id: value })} error={erroDocampo('categoria_id')} />
                </div>
              </div>
                
              <div className="row mb-3">
                <div className="col-md-4">
                  <label htmlFor="isbn" className="form-label">ISBN</label>
                  <input
                    type="text"
                    id="isbn"
                    name="isbn"
                    className={`form-control ${erroDocampo('isbn') ? 'is-invalid' : ''}`}
                    value={dados.isbn}
                    onChange={handleChange}
                    placeholder="978-85-00000-00-0"
                  />
                  {erroDocampo('isbn') && <div className="invalid-feedback">{erroDocampo('isbn')}</div>}
                </div>
                
                <div className="col-md-4">
                  <label htmlFor="isbn" className="form-label">Preço</label>
                  <input
                    type="text"
                    id="preco"
                    name="preco"
                    className={`form-control ${erroDocampo('preco') ? 'is-invalid' : ''}`}
                    value={dados.preco}
                    onChange={handleChange}
                    placeholder="R$"
                  />
                  {erroDocampo('preco') && <div className="invalid-feedback">{erroDocampo('preco')}</div>}
                </div>

                <div className="col-md-4">
                  <label htmlFor="numero_paginas" className="form-label"> Nº de páginas </label>
                  <input type="number" id="numero_paginas" name="numero_paginas" className={`form-control ${erroDocampo('numero_paginas') ? 'is-invalid':''}`}
                  value={dados.numero_paginas} onChange={handleChange} placeholder="320" min={1} required />
                  { erroDocampo('numero_paginas') && <div className="invalid-feedback">{ erroDocampo('numero_paginas') }</div> } 
                </div>

                <div className="col-md-4">
                  <label htmlFor="publicacao" className="form-label">Data de publicação</label>
                  <input
                    type="date"
                    id="publicacao"
                    name="publicacao"
                    className={`form-control ${erroDocampo('publicacao') ? 'is-invalid' : ''}`}
                    value={dados.publicacao}
                    onChange={handleChange}
                    required
                  />
                  {erroDocampo('publicacao') && <div className="invalid-feedback">{erroDocampo('publicacao')}</div>}
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="imagem_capa" className="form-label"> URL da capa </label>
                <input type="url" id="imagem_capa" name="imagem_capa" className={`form-control ${erroDocampo('imagem_capa') ? 'is-invalid':''}`}
                onChange={handleChange} placeholder="https://exemplo.com/capa.jpg" required />
                { erroDocampo('imagem_capa') && <div className="invalid-feedback">{erroDocampo('imagem_capa')}</div> }
                { dados.imagem_capa && (
                  <div className="mt-2">
                    <img src={dados.imagem_capa}
                         alt="Preview da capa"
                         height={120}
                         style={{ objectFit: 'cover', borderRadius: '4px' }}
                         onError={(e) => {e.currentTarget.style.display = 'none' }} />
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="descricao" className="form-label">Descrição</label>
                <textarea id="descricao" name="descricao" className={`form-control ${erroDocampo('descricao') ? 'is-invalid':''}`}
                value={dados.descricao} onChange={handleChange} rows={3} required />
                {erroDocampo('descricao') && <div className="invalid-feedback">{erroDocampo('descricao')}</div>}
              </div> 

              <div className="mb-4">
                <label htmlFor="sobre" className="form-label">Sobre o livro</label>
                <textarea
                  id="sobre"
                  name="sobre"
                  className={`form-control ${erroDocampo('sobre') ? 'is-invalid' : ''}`}
                  value={dados.sobre}
                  onChange={handleChange}
                  placeholder="Texto completo sobre o livro"
                  rows={5}
                />
                {erroDocampo('sobre') && <div className="invalid-feedback">{erroDocampo('sobre')}</div>}
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-dark flex-grow-1" disabled={carregando}>
                  { carregando ? <><span className="spinner-border spinner-border-sm me-2" /> Salvando... </> : 'Salvar' }
                </button>
                <Link to="/admin/livros" className="btn btn-outline-secondary"> Cancelar </Link>
              </div>
            </form>
          </div>
        </div>
      </div>  
    </div>  
    </>
  )
}
