import { useEffect, useState } from 'react'
import api from '../api/axios'


export function HistoricoPedidos() {
    const [pedidos, setPedidos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/historico-pedidos')
           .then(res => setPedidos(res.data))
           .catch(err => console.error(err))
           .finally(() => setLoading(false))
    }, [])

    function formatarPreco(valor: number){
        return valor.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL',
        }) 
    }

    function getStatusColor(status: string) {
       switch(status) {
            case 'pago': return 'bg-success'
            case 'pending': return 'bg-warning'
            case 'failed': return 'bg-danger'
            default: return 'bg-secondary'
        }
    }

    if(loading){
        return <p className="text-center mt-5"> Carregando pedidos... </p>
    }
    if(pedidos.length === 0){
        return <p className="text-center mt-5"> Você não possui pedidos </p>
    }

    return (
        <div className="container py-5">
            <h2 className="mb-4 text-center">Meus Pedidos</h2>

            {pedidos.map((pedido: any) => (
                <div key={pedido.id} className="card mb-4 shadow-sm">
                    <div className="card-header d-flex justify-content-between">
                        <span> Pedido #{pedido.id} </span>
                        <span className="badge bg-success">
                            { pedido.status }
                        </span>
                    </div>

                    <div className="card-body">
                        {pedido.itens.map((item: any) => (
                            <div key={item.livro_id} className="d-flex align-items-center mb-3">
                                <img src={item.imagem_capa} alt={item.titulo} style={{ width: '60px', height: '80px', objectFit: 'cover' }} className="me-3" />
                                <div className="flex-grow-1">
                                    <h6 className="mb-1">{item.titulo}</h6>
                                    <small className="text-muted">
                                        {item.quantidade} x {formatarPreco(parseFloat(item.preco_unitario))}
                                    </small>
                                </div>

                                <strong>
                                    R$ {formatarPreco(item.subtotal)}
                                </strong>
                            </div>
                        ))}

                        <hr/>

                        <div className="text-end">
                            <strong> Total: R$ {formatarPreco(pedido.total)} </strong>
                        </div>
                    </div>                  
                    <span className={`badge ${getStatusColor((pedido.status).toString())}`}>
                        {pedido.status}
                    </span>
                </div>

            ))}
        </div>
       
    )
}


