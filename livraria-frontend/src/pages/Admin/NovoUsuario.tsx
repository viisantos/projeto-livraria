import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'

interface NovoUsuarioData {
    name: string
    email: string
    password: string
    password_confirmation: string
    role: 'admin' | 'comprador'
}

export function NovoUsuario() {
    const navigate = useNavigate()

    const [dados, setDados] = useState<NovoUsuarioData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'comprador'
    })

    const [erros, setErros] = useState<Record<string, string[]>>({})
    const [carregando, setCarregando] = useState<boolean>(false)
    const [modalAberta, setModalAberta] = useState<boolean>(false)

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
        setDados({ ...dados, [e.target.name]: e.target.value})
    }

    useEffect(() => {
      if (carregando) {
        setModalAberta(true)
      }
    }, [carregando])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault()
        setErros({})
        setCarregando(true)

        try{
            await api.post('/usuarios', dados)
            navigate('/admin/usuarios')
        }catch(error: any){
            if(error.response?.status === 422){
                setErros(error.response.data.errors)
            }
        }finally{
            setCarregando(false)
        }
    }

    function erroDoCampo(campo: string): string {
        return erros[campo]?.[0] ?? ''
    }

    function handleConfirmarModal(): void {
        setModalAberta(false)
    }

    return(
        <>
        <div className="row justify-content-center">
            <div className="col-12 col-md-7 col-lg-5">
                <div className="d-flex align-items-center gap-3 mb-4">
                    <Link to="/admin/usuarios" className="btn btn-outline-secondary btn-sm">
                        ← Voltar 
                    </Link>
                    <h4 className="mb-0">Novo usuário</h4>
                </div>
                <div className="card shadow-sm">
                    <div className="card-body p-4">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Nome</label>
                                <input type="text" id="name" name="name" className={`form-control ${erroDoCampo('name') ? 'is-invalid' : ''}`}
                                value={dados.name} onChange={handleChange} placeholder="Nome completo" required />
                                { erroDoCampo('name') && (<div className="invalid-feedback">{ erroDoCampo('name') }</div>) }
                            </div>

                            <div className="mb-3">
                                <label htmlFor="email" className="form-label"> E-mail </label>
                                <input type="email" id="email" name="email" className={`form-control ${erroDoCampo('email') ? 'is-invalid' : ''}`}
                                value={dados.email} onChange={handleChange} placeholder="email@exemplo.com" required />

                                {erroDoCampo('email') && (
                                    <div className="invalid-feedback">{erroDoCampo('email')}</div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="password" className="form-label"> Senha </label>
                                <input type="password" id="password" name="password" className={`form-control ${erroDoCampo('password') ? 'is-invalid':''}`} 
                                value={dados.password} onChange={handleChange} placeholder="Mínimo 8 caracteres" required />
                                {erroDoCampo('password') && (
                                    <div className="invalid-feedback"> {erroDoCampo('password')} </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="password_confirmation" className="form-label"> Confirmar senha </label>
                                <input type="password" id="password_confirmation" name="password_confirmation" className="form-control"
                                value={dados.password_confirmation} onChange={handleChange} placeholder="Repita a senha" required />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="role" className="form-label">Perfil</label>
                                <select id="role" name="role" className="form-select" value={dados.role} onChange={handleChange}>
                                    <option value="comprador"> Comprador </option>
                                    <option value="admin"> Admin </option>
                                </select>
                            </div>

                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-dark flex-grow-1" disabled={carregando}>
                                    { carregando ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm me-2" />
                                          Salvando...
                                        </>
                                    ) : 'Salvar'}
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
                    Cadastro Efetuado com sucesso!
                </p>
                </div>
            </div>
            </div>
        </div>
        )}
    </>
    )
}

