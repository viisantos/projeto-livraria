import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import api from '../api/axios'

export function LeitorEbook() {
    const { id } = useParams()
    const [arquivoUrl, setArquivoUrl] = useState<string | null>(null)
    const [erro, setErro] = useState('')

    useEffect(() => {
        let url = ''

        api.get('/biblioteca/livros/' + id + '/leitura', { responseType: 'blob' })
            .then((response) => {
                url = URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' }))
                setArquivoUrl(url)
            })
            .catch(async (error) => {
                if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
                    try {
                        setErro((JSON.parse(await error.response.data.text()) as { message?: string }).message || 'Não foi possível carregar o ebook.')
                    } catch {
                        setErro('Não foi possível carregar o ebook.')
                    }
                    return
                }
                setErro('Não foi possível carregar o ebook.')
            })

        return () => {
            if (url) URL.revokeObjectURL(url)
        }
    }, [id])

    if (erro) {
        return <div className="text-center py-5"><h3>Não foi possível abrir este ebook</h3><p className="text-muted">{erro}</p><Link className="btn btn-dark" to="/minha-biblioteca">Voltar à biblioteca</Link></div>
    }

    if (!arquivoUrl) {
        return <div className="d-flex justify-content-center py-5"><div className="spinner-border" role="status" /></div>
    }

    return <div className="container py-4"><Link className="btn btn-outline-secondary btn-sm mb-3" to="/minha-biblioteca"><FaArrowLeft className="me-1" />Voltar à biblioteca</Link><iframe src={arquivoUrl} title="Leitor do ebook" className="w-100 border rounded" style={{ height: 'calc(100vh - 180px)', minHeight: '480px' }} /></div>
}
