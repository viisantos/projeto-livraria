import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import type { Pedido } from '../types'

export function HistoricoPedidos() {
    const [pedidos, setPedidos] = useState<Pedido[]>([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')

    useEffect(() => {
        api.get<Pedido[]>('/historico-pedidos')
            .then((res) => setPedidos(res.data))
            .catch((err) => {
                console.error(err)
                setErro('Não foi possível carregar seus pedidos.')
            })
            .finally(() => setLoading(false))
    }, [])

    function formatarPreco(valor: number | string): string {
        return Number(valor).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        })
    }

    function formatarData(data: string): string {
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    function getStatusColor(status: string): string {
        switch (status) {
            case 'pago': return 'bg-success'
            case 'pendente': return 'bg-warning'
            case 'falha': return 'bg-danger'
            default: return 'bg-secondary'
        }
    }

    function getStatusLabel(status: string): string {
        switch (status) {
            case 'pago': return 'Pago'
            case 'pendente': return 'Pendente'
            case 'falha': return 'Falha'
            default: return status
        }
    }

    if (loading) {
        return <p className="text-center mt-5">Carregando pedidos...</p>
    }

    if (erro) {
        return <p className="text-center mt-5 text-danger">{erro}</p>
    }

    if (pedidos.length === 0) {
        return <p className="text-center mt-5">Você não possui pedidos</p>
    }

    return (
        <div className="container py-5">
            <h2 className="mb-4 text-center">Meus Pedidos</h2>

            {pedidos.map((pedido) => (
                <div key={pedido.id} className="card mb-4 shadow-sm">
                    <div className="card-header d-flex flex-wrap gap-2 justify-content-between align-items-center">
                        <div>
                            <span className="fw-semibold">Pedido #{pedido.id}</span>
                            <small className="text-muted ms-2">{formatarData(pedido.created_at)}</small>
                        </div>
                        <span className={`badge ${getStatusColor(pedido.status)}`}>
                            {getStatusLabel(pedido.status)}
                        </span>
                    </div>

                    <div className="card-body">
                        {pedido.itens.slice(0, 3).map((item) => (
                            <div key={item.livro_id} className="d-flex align-items-center mb-3">
                                <img
                                    src={item.imagem_capa}
                                    alt={item.titulo}
                                    style={{ width: '60px', height: '80px', objectFit: 'cover' }}
                                    className="me-3"
                                />
                                <div className="flex-grow-1">
                                    <h6 className="mb-1">{item.titulo}</h6>
                                    <small className="text-muted">
                                        {formatarPreco(item.preco)}
                                    </small>
                                </div>

                                <strong>{formatarPreco(item.subtotal)}</strong>
                            </div>
                        ))}

                        {pedido.itens.length > 3 && (
                            <p className="text-muted mb-3">
                                + {pedido.itens.length - 3} item(ns) neste pedido
                            </p>
                        )}

                        <hr />

                        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
                            <Link className="btn btn-outline-dark btn-sm" to={`/pedidos/${pedido.id}`}>
                                Ver detalhes
                            </Link>
                            <strong>Total: {formatarPreco(pedido.total)}</strong>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
