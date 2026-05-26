import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { LoginCredentials } from '../types'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  })

  const [erro, setErro] = useState<string>('')
  const [carregando, setCarregando] = useState<boolean>(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setCredentials({ ...credentials, [e.target.name]: e.target.value})
  }

  async function handleSubmit(e: FormEvent): Promise<void>{
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try{
      const user = await login(credentials)

      if(user.perfil === 'admin'){
          navigate('/admin/livros')
      }else{
        navigate('/catalogo')
      }
    } catch(error: any){
      setErro(error.response?.data?.message ?? 'Credenciais inválidas.')
    } finally {
      setCarregando(false)
    }
  }

  return(
    <div className="row justify-content-center mt-5">
      <div className="col-12 col-sm-8 col-md-6 col-lg-4">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h4 className="card-title mb-4 text-center"> Entrar </h4>
             { erro && (
                 <div className="alert alert-danger" role="alert">
                  { erro }
                 </div>
             )}
              
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  E-mail
                </label>
                <input type="email" id="email" name="email" className="form-control" value={ credentials.email }
                onChange={handleChange} placeholder="insira email" required />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label">
                  Senha
                </label>
                <input type="password" id="password" name="password" className="form-control" value={credentials.password}
                onChange={handleChange} placeholder="Sua senha" required />               
              </div>

              <button type="submit" className="btn btn-dark w-100">
                 { carregando ? (<>
                      <span className="spinner-border spinner-border-sm me-2" />
                        Entrando...
                    </>) : ('Entrar')}
              </button>
            </form> 
            <hr/>
            <p className="text-center mb-0 text-muted small">
                Não tem conta? {' '}
                <Link to="/register"> Cadastre-se </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}