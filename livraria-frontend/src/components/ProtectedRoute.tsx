import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps{
    children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps){
    const { autenticado, loading } = useAuth()
    if(loading) {
        return(
            <div className="d-flex justify-content-center mt-5">
                <div className="spinner-border" role="status" />
            </div>
        )
    }
    return autenticado ? <>{ children }</> : <Navigate to="/login" />
}
