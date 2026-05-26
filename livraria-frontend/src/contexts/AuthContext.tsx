import { createContext, useState, useEffect, type ReactNode } from 'react'
import api from '../api/axios'
import type { User, LoginCredentials, RegisterData, AuthResponse } from '../types'

interface AuthContextData {
    user: User | null
    token: string | null
    loading: boolean
    autenticado: boolean
    login: (credentials: LoginCredentials) => Promise<User>
    //register: (dados: RegisterData) => Promise<User>
    logout: () => Promise<void>
    isAdmin: () => boolean 
    isComprador: () => boolean
}

interface AuthProviderProps {
    children: ReactNode
}

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({children}: AuthProviderProps){
    const [user, setUser]       = useState<User | null>(null)
    const [token, setToken]     = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const tokenSalvo = localStorage.getItem('token')
        const userSalvo  = localStorage.getItem('user')

        if(tokenSalvo && userSalvo){
            setToken(tokenSalvo)
            setUser(JSON.parse(userSalvo) as User)
        }

        setLoading(false)
    }, [])

    async function login(credentials: LoginCredentials): Promise<User> {
        const response = await api.post<AuthResponse>('/login', credentials)
        const { authorisation, user } = response.data
        localStorage.setItem('token', authorisation.token)
        localStorage.setItem('user', JSON.stringify(user))

        setToken(authorisation.token)
        setUser(user)
        console.log(user);

        return user
    }

    /*async function register(dados: RegisterData): Promise<User> {
        const response = await api.post<AuthResponse>('/register', dados)
        const { authorisation, user } = response.data
        localStorage.setItem('token', authorisation.token)
        localStorage.setItem('user', JSON.stringify(user))

        setToken(authorisation.token)
        setUser(user)

        return user
    }*/

    async function logout(): Promise<void> {
        try{
            await api.post('/logout')
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setToken(null)
            setUser(null)
        }
    }

    function isAdmin(): boolean {
        //console.log(user?.roles[0]?.name)
        return user?.roles[0]?.name === 'admin'
    }

    function isComprador(): boolean {
        return user?.roles[0]?.name === 'comprador'
    }

    return (
        <AuthContext.Provider value={{
            user,
            token, 
            loading,
            autenticado: !!token, //transformando em bool o valor.
            login,
            //register,
            logout,
            isAdmin,
            isComprador,
        }}>
         { children }
         </AuthContext.Provider>
    )
}