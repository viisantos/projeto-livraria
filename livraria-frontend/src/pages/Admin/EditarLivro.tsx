import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import type { Livro } from '../../types' 
import { PaginatedEntitySelect } from '../../components/PaginatedEntitySelect'

interface EditarLivroData {
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

export function EditarLivro() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [dados, setDados] = useState<EditarLivroData>({
    titulo: '',
    slug: '',
    descricao: '',
    isbn: '',
    numero_paginas: '',
    publicacao: '',
    imagem_capa: '',
    sobre: '',
    autor_id: '',
    categoria_id: '', 
    preco: ''
  })

  const [erros, setErros] = useState<Record<string, string[]>>({})
  const [carregando, setCarregando] = useState<boolean>(true)
  const [salvando, setSalvando] = useState<boolean>(false)
  const [erro, setErro] = useState<string>('')
  const [ebook, setEbook] = useState<File | null>(null)
  const [autorSelecionado, setAutorSelecionado] = useState<string>('')
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('')

  useEffect(() => {
    buscarDados()
  }, [id])

  async function buscarDados(): Promise<void> {
    setCarregando(true)

    try{
      const response = await api.get<Livro>(`/livros/${id}`)
      const livro = response.data
      setAutorSelecionado(livro.autor?.nome ?? '')
      setCategoriaSelecionada(livro.categoria?.nome ?? '')

      setDados({
        titulo: livro.titulo,
        slug: livro.slug,
        descricao: livro.descricao,
        isbn: livro.isbn,
        numero_paginas: String(livro.numero_paginas),
        publicacao: livro.publicacao,
        imagem_capa: livro.imagem_capa,
        sobre: livro.sobre ?? '',
        autor_id: String(livro.autor?.id ?? ''),
        categoria_id: String(livro.categoria?.id ?? ''), 
        preco: String(livro.preco)
      }) 
    } catch {
      setErro('Livro não encontrado')
    } finally {
      setCarregando(false)
    }
  }

   function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void {
      setDados({ ...dados, [e.target.name]: e.target.value })
   }

   async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setErros({})
    setSalvando(true)

    try {
       const formData = new FormData()
       Object.entries(dados).forEach(([campo, valor]) => formData.append(campo, valor))
       formData.set('preco', dados.preco.replace(',', '.'))                                                                    
       formData.append('_method', 'PUT')
       if (ebook) formData.append('ebook', ebook)
       await api.post('/livros/' + id, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
       navigate('/admin/livros')
    } catch (error: any) {
      if(error.response?.status === 422){
        setErros(error.response.data.errors)
      }
    } finally {
      setSalvando(false)
    }
   }

   function erroDocampo(campo: string): string {
     return erros[campo]?.[0] ?? ''
   }
   
   if(carregando) return (
     <div className="d-flex justify-content-center py-5">
      <div className="spinner-border" role="status" />
     </div>
   )

   if (erro) return (
      <div className="text-center py-5">
        <div className="alert alert-danger d-inline-block">{ erro }</div> <br/>
        <Link to="/admin/livros" className="btn btn-outline-dark btn-sm mt-3"> Voltar para livros </Link>
      </div>
   )

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-10 col-lg-8">
        <div className="d-flex align-items-center gap-3 mb-4">
          <Link to="/admin/livros" className="btn btn-outline-secondary btn-sm">← Voltar</Link>
          <h4 className="mb-0"> Editar livro </h4>
        </div>

         <div className="card shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="titulo" className="form-label">Título</label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    className={`form-control ${erroDocampo('titulo') ? 'is-invalid' : ''}`}
                    value={dados.titulo}
                    onChange={handleChange}
                    required
                  />
                  {erroDocampo('titulo') && <div className="invalid-feedback">{erroDocampo('titulo')}</div>}
                </div>
                <div className="col-md-6">
                  <label htmlFor="slug" className="form-label">Slug</label>
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
                <label htmlFor="ebook" className="form-label">Substituir arquivo do ebook</label>
                <input type="file" id="ebook" name="ebook" accept=".pdf,.epub,application/pdf,application/epub+zip" className="form-control" onChange={(e) => setEbook(e.target.files?.[0] ?? null)} />
                <small className="text-muted">Deixe vazio para manter o arquivo atual. PDF ou EPUB, até 50 MB.</small>
                {ebook && <div className="form-text">{ebook.name}</div>}
                {erroDocampo('ebook') && <div className="text-danger small">{erroDocampo('ebook')}</div>}
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <PaginatedEntitySelect endpoint="/autores" id="autor_id" label="Autor" name="autor_id" value={dados.autor_id} selectedLabel={autorSelecionado} onChange={(value) => setDados({ ...dados, autor_id: value })} error={erroDocampo('autor_id')} />
                </div>

                <div className="col-md-6">
                  <PaginatedEntitySelect endpoint="/categorias" id="categoria_id" label="Categoria" name="categoria_id" value={dados.categoria_id} selectedLabel={categoriaSelecionada} onChange={(value) => setDados({ ...dados, categoria_id: value })} error={erroDocampo('categoria_id')} />
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
                  <label htmlFor="numero_paginas" className="form-label">Nº de páginas</label>
                  <input
                    type="number"
                    id="numero_paginas"
                    name="numero_paginas"
                    className={`form-control ${erroDocampo('numero_paginas') ? 'is-invalid' : ''}`}
                    value={dados.numero_paginas}
                    onChange={handleChange}
                    min={1}
                    required
                  />
                  {erroDocampo('numero_paginas') && <div className="invalid-feedback">{erroDocampo('numero_paginas')}</div>}
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
                <label htmlFor="imagem_capa" className="form-label">URL da capa</label>
                <input type="url" id="imagem_capa" name="imagem_capa" className={`form-control ${erroDocampo('imagem_capa') ? 'is-invalid':''}`}
                 value={dados.imagem_capa} onChange={handleChange} required />
                 { erroDocampo('imagem_capa') && <div className="invalid-feedback">{ erroDocampo('imagem_capa') }</div> }
                 { dados.imagem_capa && (
                   <div className="mt-2">
                    <img src={dados.imagem_capa} alt="Preview da capa" height={120}
                    style={{ objectFit: 'cover', borderRadius: '4px' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />         
                   </div>
                 )}
              </div>   
              <div className="mb-3">
                 <label htmlFor="descricao" className="form-label"> Descrição </label>
                 <textarea id="descricao" name="descricao" className={`form-control ${erroDocampo('descricao') ? 'is-invalid':''}`}
                 value={dados.descricao} onChange={handleChange} rows={3} required />
                 { erroDocampo('descricao') && <div className="invalid-feedback">{ erroDocampo('descricao') }</div> }
              </div>

              <div className="mb-4">
                 <label htmlFor="sobre" className="form-label"> Sobre o livro </label>
                 <textarea id="sobre" name="sobre" className={`form-control ${erroDocampo('sobre') ? 'is-invalid':''}`}
                 value={dados.sobre} onChange={handleChange} rows={5} /> 
                 { erroDocampo('sobre') && <div className="invalid-feedback">{ erroDocampo('sobre') } </div> }
              </div>

              <div className="d-flex gap-2">
                 <button type="submit" className="btn btn-dark flex-grow-1" disabled={salvando}>
                    { salvando ? <><span className="spinner-border spinner-border-sm me-2" /> Salvando... </> : 'Salvar alterações'}
                 </button>
                 <Link to="/admin/livros" className="btn btn-outline-secondary"> Cancelar </Link>
              </div>            
          </form>
      </div>
    </div>
  </div>
</div>)}
