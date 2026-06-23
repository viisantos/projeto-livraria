import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBookOpen } from 'react-icons/fa'
import api from '../api/axios'
import type { BibliotecaLivro, BibliotecaResponse } from '../types'

export function MinhaBiblioteca() {
    const navigate = useNavigate()
    const [livros, setLivros] = useState<BibliotecaLivro[]>([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState('')

    useEffect(() => {
        api.get<BibliotecaResponse>('/minha-biblioteca')
            .then((response) => setLivros(response.data.data))
            .catch(() => setErro('Não foi possível carregar sua biblioteca.'))
            .finally(() => setCarregando(false))
    }, [])

    if (carregando) {
        return <div className="d-flex justify-content-center py-5"><div className="spinner-border" role="status" /></div>
    }

    if (erro) {
        return <div className="text-center py-5"><h3>Não foi possível carregar a biblioteca</h3><p className="text-muted">{erro}</p></div>
    }

    if (!livros.length) {
        return <div className="text-center py-5"><FaBookOpen size={42} className="text-muted mb-3" /><h2>Minha Biblioteca</h2><p className="text-muted">Você ainda não possui ebooks disponíveis para leitura.</p><button className="btn btn-dark" onClick={() => navigate('/catalogo')}>Explorar catálogo</button></div>
    }

    return (
        <div className="container py-5">
            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Minha Biblioteca</h2>
                <button className="btn btn-outline-dark" onClick={() => navigate('/catalogo')}>Explorar catálogo</button>
            </div>
            <div className="row g-4">
                {livros.map((livro) => (
                    <div key={livro.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                        <div className="card h-100 shadow-sm">
                            <img src={livro.imagem_capa} alt={livro.titulo} className="card-img-top" style={{ height: '300px', objectFit: 'cover' }} />
                            <div className="card-body d-flex flex-column">
                                <div className="d-flex justify-content-between gap-2">
                                    <h5>{livro.titulo}</h5>
                                    {livro.formato_ebook && <span className="badge bg-secondary text-uppercase">{livro.formato_ebook}</span>}
                                </div>
                                <p className="text-muted">{livro.autor?.nome}</p>
                                <small className="text-muted mb-3">Adquirido em {new Date(livro.adquirido_em).toLocaleDateString('pt-BR')}</small>
                                <button className="btn btn-dark w-100 mt-auto" disabled={!livro.leitura_disponivel} onClick={() => navigate('/minha-biblioteca/' + livro.id + '/ler')}>
                                    <FaBookOpen className="me-2" />
                                    {livro.leitura_disponivel ? 'Ler ebook' : 'Leitura indisponível'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
