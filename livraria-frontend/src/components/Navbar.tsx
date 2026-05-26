import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/logoLivraria2.png'
import { FaShoppingCart } from 'react-icons/fa'
import { useEffect } from 'react'


export function Navbar() {
    const { user, autenticado, isAdmin, logout } = useAuth()
    const navigate = useNavigate()
   
    async function handleLogout(): Promise<void>{
        await logout()
        navigate('/login')
    }
   
    return(
        <nav className="navbar navbar-expand navbar-expand-sm navbar-expand-lg navbar-expand-md navbar-dark bg-dark py-1">
            <div className="container-fluid px-5">
            <Link className="navbar-brand fw-bold" to="/"> <img src={logo} alt="Livraria" width={50} height={50} style={{ objectFit: 'contain' }} /> <span>Livraria</span> </Link>
            <div className="collapse navbar-collapse" id="navbarContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    {autenticado && (
                        <li className="nav-item">
                            <Link className="nav-link" to="/catalogo"> Catálogo </Link>
                        </li>
                    )}
                    
                    { isAdmin() && (
                        <>
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/livros"> Livros </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/autores"> Autores </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/categorias"> Categorias </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/usuarios"> Usuarios </Link>
                            </li>
                        </>
                    )}
                </ul>

                <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                    { autenticado ? (
                        <>
                            <li className="nav-item">
                                <span className="nav-link text-light">
                                    Olá, { user?.name }
                                </span>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/carrinho">
                                    <FaShoppingCart size={20} /> Carrinho
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/pedidos">
                                    Meus pedidos 
                                </Link>
                            </li>
                            <li className="nav-item">
                                <button className="btn btn-outline-light btn-md ms-2" onClick={handleLogout} > Sair </button>
                            </li>
                            
                        </>
                    ) : (
                        <>
                            <li className="nav-item ">
                                <Link className="nav-link" to="/login"><button className="btn btn-outline-light"> Entrar </button> </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/register"><button className="btn btn-outline-light"> Cadastrar </button></Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>

            </div>
        </nav>
    )
}