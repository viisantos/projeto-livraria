import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface AdminRouteProps{
    children: ReactNode
}

export function AdminRoute({ children }: AdminRouteProps){
    const { autenticado, isAdmin, loading } = useAuth()
    
    if(loading){
        return(
            <div className="d-flex justifuy-content-center mt-5">
                <div className="spinner-border" role="status" />
            </div>
        )
    }

    if (!autenticado) return <Navigate to="/login" />
    if(!isAdmin()) return <Navigate to="/catalogo" />

    return <>{ children }</>
}