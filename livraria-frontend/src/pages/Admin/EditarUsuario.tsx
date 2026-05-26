import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import type { User } from '../../types'

interface EditarUsuarioData {
    id: number
    name: string
    email: string
    role: 'admin' | 'comprador'
}

export function EditarUsuario() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [dados, setDados] = useState<EditarUsuarioData>({
        id: Number(id),
        name: '',
        email: '',
        role: 'comprador'
    })
    const [erros, setErros] = useState<Record<string, string[]>>({})
    const [carregando, setCarregando] = useState<boolean>(true)
    const [salvando, setSalvando] = useState<boolean>(false)
    const [erro, setErro] = useState<string>('')

    useEffect(() => {
        buscarUsuario()
    }, [id])

    async function buscarUsuario(): Promise<void> {
        setCarregando(true)

        try{
            const response = await api.get<User>(`/usuarios/${id}`)
            const usuario = response.data
            console.log(usuario)

            setDados({
                id: Number(id),
                name: usuario.name,
                email: usuario.email,
                role: usuario.perfil
            })
        }catch {
            setErro('Usuário não encontrado')
        } finally {
            setCarregando(false)
        }
     
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
        setDados({ ...dados, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault()
        setErros({})
        setSalvando(true)

        try{
            console.log("enviando para a api : "+ dados.role)                       
            const response = await api.put(`/usuarios/${id}`, dados)
            navigate('/admin/usuarios')
        }catch(error: any){
          console.log(error)
            if(error.response?.status === 422){
                setErros(error.response.data.errors)
            }
        }finally{
            setSalvando(false)
        }
    }

    function erroDocampo(campo: string): string {
        return erros[campo]?.[0] ?? ''
    }

    if(carregando){
        return (
            <div className="d-flex justify-content-center py-5">
                <div className="spinner-border" role="status" />
            </div>
        )
    }

    if(erro) {
        return(
            <div className="text-center py-5">
                <div className="alert alert-danger d-inline-block">{erro}</div>
                <br />
                <Link to="/admin/usuarios" className="btn btn-outline-dark btn-sm mt-3">
                    Voltar para lista de usuários
                </Link>
            </div>
        )
    }
    return(<>
        <div className="row justify-content-center">
      <div className="col-12 col-md-7 col-lg-5">

        <div className="d-flex align-items-center gap-3 mb-4">
          <Link to="/admin/usuarios" className="btn btn-outline-secondary btn-sm">
            ← Voltar
          </Link>
          <h4 className="mb-0">Editar usuário</h4>
        </div>

        <div className="card shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>

              <div className="mb-3">
                <label htmlFor="name" className="form-label">Nome</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-control ${erroDocampo('name') ? 'is-invalid' : ''}`}
                  value={dados.name}
                  onChange={handleChange}
                  required
                />
                {erroDocampo('name') && (
                  <div className="invalid-feedback">{erroDocampo('name')}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">E-mail</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control ${erroDocampo('email') ? 'is-invalid' : ''}`}
                  value={dados.email}
                  onChange={handleChange}
                  required
                />
                {erroDocampo('email') && (
                  <div className="invalid-feedback">{erroDocampo('email')}</div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="role" className="form-label">Perfil</label>
                <select
                  id="role"
                  name="role"
                  className="form-select"
                  value={dados.role}
                  onChange={handleChange}
                >
                  <option value="comprador">Comprador</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-dark flex-grow-1"
                  disabled={salvando}
                >
                  {salvando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Salvando...
                    </>
                  ) : 'Salvar alterações'}
                </button>
                <Link to="/admin/usuarios" className="btn btn-outline-secondary">
                  Cancelar
                </Link>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
    </>) 
}