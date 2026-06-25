import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import api from '../api/axios'
import type { Pedido } from '../types'

export function DetalhePedido() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [pedido, setPedido] = useState<Pedido | null>(null)
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')

    useEffect(() => {
        buscarPedido()
    }, [id])

    async function buscarPedido(): Promise<void> {
        if (!id) {
            setErro('Pedido não encontrado.')
            setLoading(false)
            return
        }

        setLoading(true)
        setErro('')

        try {
            const response = await api.get<Pedido>(`/pedidos/${id}`)
            setPedido(response.data)
        } catch (error) {
            console.error('Erro ao buscar detalhes do pedido', error)
            setErro('Não foi possível carregar os detalhes deste pedido.')
        } finally {
            setLoading(false)
        }
    }

    function formatarPreco(valor: number | string): string {
        return Number(valor).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        })
    }

    function formatarData(data: string): string {
        return new Date(data).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    function getStatusColor(status: string): string {
        switch (status) {
            case 'pago': return 'bg-success'
            case 'pendente': return 'bg-warning text-dark'
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

    function getStatusMessage(status: string): string {
        switch (status) {
            case 'pago': return 'Pagamento aprovado. Seu pedido foi confirmado.'
            case 'pendente': return 'Pagamento pendente. Assim que o pagamento for confirmado, o pedido será atualizado.'
            case 'falha': return 'Pagamento não concluído. Você pode revisar seu carrinho e tentar novamente.'
            default: return 'Acompanhe o status deste pedido por aqui.'
        }
    }

    if (loading) {
        return <p className="text-center mt-5">Carregando detalhes do pedido...</p>
    }

    if (erro || !pedido) {
        return (
            <div className="container py-5 text-center">
                <h3 className="mb-3">Pedido não encontrado</h3>
                <p className="text-muted">{erro || 'Não foi possível encontrar este pedido.'}</p>
                <button className="btn btn-dark mt-2" onClick={() => navigate('/pedidos')}>
                    Voltar aos pedidos
                </button>
            </div>
        )
    }

    return (
        <div className="container py-5">
            <Link className="btn btn-outline-secondary btn-sm mb-4" to="/pedidos">
                <FaArrowLeft className="me-1" />
                Voltar aos pedidos
            </Link>

            <div className="d-flex flex-wrap gap-3 justify-content-between align-items-start mb-4">
                <div>
                    <h2 className="mb-1">Pedido #{pedido.id}</h2>
                    <p className="text-muted mb-0">Realizado em {formatarData(pedido.created_at)}</p>
                </div>

                <span className={`badge fs-6 ${getStatusColor(pedido.status)}`}>
                    {getStatusLabel(pedido.status)}
                </span>
            </div>

            <div className={`alert ${pedido.status === 'falha' ? 'alert-danger' : pedido.status === 'pendente' ? 'alert-warning' : 'alert-success'}`}>
                {getStatusMessage(pedido.status)}
            </div>

            <div className="row g-4">
                <div className="col-12 col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-header">
                            <strong>Itens do pedido</strong>
                        </div>
                        <div className="card-body">
                            {pedido.itens.map((item) => (
                                <div key={item.livro_id} className="d-flex align-items-center border-bottom pb-3 mb-3">
                                    <img
                                        src={item.imagem_capa}
                                        alt={item.titulo}
                                        style={{ width: '72px', height: '96px', objectFit: 'cover' }}
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
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-header">
                            <strong>Resumo</strong>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Itens</span>
                                <span>{pedido.itens.length}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Status</span>
                                <span>{getStatusLabel(pedido.status)}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between fs-5">
                                <strong>Total</strong>
                                <strong>{formatarPreco(pedido.total)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
