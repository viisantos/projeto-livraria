import { useState, type FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
//import { useAuth } from '../hooks/useAuth'
import type { RegisterData /*AuthResponse*/} from '../types'
import api from '../api/axios'

export default function Register() {
  //const { register } = useAuth()
  const navigate = useNavigate()

  const [dados, setDados] = useState<RegisterData>({
      name: '',
      email: '',
      password: '',
      password_confirmation:''
  })
  const [erros, setErros] = useState<Record<string, string[]>>({})
  const [carregando, setCarregando] = useState<boolean>(false)
  const [modalAberta, setModalAberta] = useState<boolean>(false)
  const [nomeUsuario, setNomeUsuario] = useState<string>('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setDados({ ...dados, [e.target.name]: e.target.value })
  }

  useEffect(() => {
  if (nomeUsuario) {
    console.log(nomeUsuario)
    setModalAberta(true)
  }
}, [nomeUsuario])

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    setErros({})
    setCarregando(true)

  try{
    //const user = await register(dados)
    const response = api.post<any>('/register', dados)
    const name = (await response).data.name
    //console.log((await response).data.name)
    setNomeUsuario(name)
  }catch (error: any){
    if(error.response?.status === 422){
      setErros(error.response.data.errors)
    }
  }finally{
    setCarregando(false)
  }

}

  function erroDocampo(campo: string): string {
    return erros[campo]?.[0] ?? ''
  }

  //não está funcionando adequadamente, ele ia para catálogo. Mas mesmo assim ia para tela de login ao clicar.
  function handleConfirmarModal(): void {
    setModalAberta(false)
    navigate('/login')
  }
   
  return(
    <>
    <div className="row justify-content-center mt-5">
      <div className="col-12 col-sm-10 col-md-7 col-lg-5">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h4 className="card-title mb-4 text-center"> Criar Conta </h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Nome
                </label>
                <input type="text" id="name" name="name" className={`form-control ${erroDocampo('name') ? 'is-invalid':''}`}
                value={dados.name}
                onChange={handleChange}
                placeholder="Seu nome completo" required/>

                { erroDocampo('name') && (
                  <div className="invalid-feedback"> {erroDocampo('name')}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  E-mail
                </label>
                <input type="email" id="email" name="email" className={`form-control ${erroDocampo('email') ? 'is-invalid' : ''}`} 
                value={dados.email} onChange={ handleChange } placeholder="seuemail@gmail.com" required />
                { erroDocampo('email') && (
                  <div className="invalid-feedback">{erroDocampo('email')}</div>
                )}
              </div>

               <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-control ${erroDocampo('password') ? 'is-invalid' : ''}`}
                  value={dados.password}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                {erroDocampo('password') && (
                  <div className="invalid-feedback">{erroDocampo('password')}</div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="password_confirmation" className="form-label">
                  Confirmar senha
                </label>
                <input
                  type="password"
                  id="password_confirmation"
                  name="password_confirmation"
                  className="form-control"
                  value={dados.password_confirmation}
                  onChange={handleChange}
                  placeholder="Repita a senha"
                  required
                />
              </div>
              <button type="submit" className="btn btn-dark w-100" disabled={carregando}>
                { carregando ? <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Criando conta...
                </> : ('Criar conta')}
              </button>
            </form>
            <hr/>
            <p className="text-center mb-0 test-muted small">
              Já tem conta?{'  '}
              <Link to="/login"> Faça login </Link>
            </p>
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
              <h5 className="modal-title"> Cadastro realizado 🎉</h5>
            </div>

            <div className="modal-body">
              <p>
                Bem vindo(a), <strong> {`${nomeUsuario}`}</strong>!
                Sua conta foi criada com sucesso!
              </p>
            </div>
            <div className="modal-footer border-0 pt-0">
                <button className="btn btn-dark w-100" onClick={ handleConfirmarModal }>
                  Ir para login
                </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}