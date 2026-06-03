import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { Navbar } from './components/Navbar'

import Login from './pages/Login'
import Register from './pages/Register'
import { Catalogo } from './pages/Catalogo'
import {Livros} from './pages/Admin/Livros'
import {NovoLivro} from './pages/Admin/NovoLivro'
import { EditarLivro } from './pages/Admin/EditarLivro'
import Categorias from './pages/Admin/Categorias'
import { NovaCategoria } from './pages/Admin/NovaCategoria'
import { EditarCategoria } from './pages/Admin/EditarCategoria'
import Usuarios from './pages/Admin/Usuarios'
import { NovoUsuario } from './pages/Admin/NovoUsuario'
import { EditarUsuario } from './pages/Admin/EditarUsuario'
import Autores from './pages/Admin/Autores'
import { NovoAutor }  from './pages/Admin/NovoAutor'
import { EditarAutor } from './pages/Admin/EditarAutor'
import { CheckoutPage } from './pages/CheckoutPage'
import { CheckoutSucesso } from './pages/CheckoutSucesso'
import { Carrinho } from './pages/Carrinho'
import { Favoritos } from './pages/Favoritos'
import { DetalheLivro } from './pages/DetalheLivro'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { HistoricoPedidos } from './pages/historicoPedidos'

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state to trigger fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error information
    this.setState({ errorInfo });

    // Call optional error reporting callback
    this.props.onError?.(error, errorInfo);
  }

  render() {
     if (this.state.hasError && this.state.error) {
      // Custom fallback or default error message
      return this.props.fallback ? (
        this.props.fallback(this.state.error, this.state.errorInfo!)
      ) : (
        <div>
          {this.state.error?.message || 'Erro desconhecido'}
        </div>      
      );
    }

    return this.props.children;
  }
}

function App() {

  return (
    <>
      <AuthProvider>
        <CartProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <Navbar/>
              <main className="container-fluid px-0">
                <div className="container mt-4">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/catalogo" element={
                      <ProtectedRoute> <Catalogo /> </ProtectedRoute>
                    } />

                    <Route path="/livros/:slug" element={
                      <ProtectedRoute> <DetalheLivro /> </ProtectedRoute>
                    } />

                    <Route path="/sucesso" element={
                      <ProtectedRoute> <CheckoutSucesso /> </ProtectedRoute>
                    } />

                    <Route path="/checkout" element={
                      <ProtectedRoute> <CheckoutPage/> </ProtectedRoute>
                    } />

                    <Route path="/pedidos" element={                    
                      <ProtectedRoute><HistoricoPedidos/></ProtectedRoute>
                    }/>

                    <Route path="/carrinho" element={ 
                      <ProtectedRoute><ErrorBoundary><Carrinho/></ErrorBoundary></ProtectedRoute> 
                    } />

                    <Route path="/favoritos" element={
                      <ProtectedRoute><Favoritos /></ProtectedRoute>
                    } />

                    <Route path="/admin/livros" element={
                        <AdminRoute><Livros/></AdminRoute>
                    } />

                    <Route path="/admin/livros/novo" element={
                      <AdminRoute><NovoLivro /></AdminRoute>
                    } />

                    <Route path="/admin/livros/:id/editar" element={
                      <AdminRoute><EditarLivro /></AdminRoute>
                    } />
                    
                    <Route path="/admin/autores" element={
                      <AdminRoute><Autores/></AdminRoute>
                    }/>

                    <Route path="/admin/autores/novo" element={
                      <AdminRoute><NovoAutor/></AdminRoute>
                    }/>
                    <Route path="/admin/autores/:id/editar" element={
                      <AdminRoute><EditarAutor/></AdminRoute>
                    }/>


                    <Route path="/admin/categorias" element={
                      <AdminRoute><Categorias/></AdminRoute>
                    }/>
                    <Route path="/admin/categorias/nova" element={
                      <AdminRoute><NovaCategoria/></AdminRoute>
                    }/>
                    <Route path="/admin/categorias/:id/editar" element={
                      <AdminRoute><EditarCategoria/></AdminRoute>
                    }/>

                    <Route path="/admin/usuarios" element={
                      <AdminRoute><Usuarios/></AdminRoute>
                    }/>
                    <Route path="/admin/usuarios/novo" element={
                      <AdminRoute><NovoUsuario/></AdminRoute>
                    }/>
                    <Route path="/admin/usuarios/:id/editar" element={
                        <AdminRoute><EditarUsuario/></AdminRoute>
                    }/>                    
                                      
                    {/* Redireciona para rota raiz caso a pessoa vá para '/*/ } 
                    <Route path="/" element={<Navigate to="/catalogo" />} />
                  </Routes>
                </div>
                </main>
          </BrowserRouter>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </>
  )
}

export default App
