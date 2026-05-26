import { useCart } from '../contexts/CartContext'
import { useNavigate } from 'react-router-dom'
import { FaPlus, FaMinus } from 'react-icons/fa'

export function Carrinho(){
    const { cart, aumentarQuantidade, diminuirQuantidade, removeFromCart, total } = useCart()
    const navigate = useNavigate()

    function formatarPreco(valor: Number) {
        return valor.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL',
        }) 
    } 
    
    if(cart.length === 0){
        return(
            <div className="container py-5 text-center">
                <h3> Seu carrinho está vazio </h3> 
                <button className="btn btn-dark mt-3" onClick={() => navigate('/')}>
                    Voltar para o catálogo
                </button>
            </div> 
        ) 
    }

    return (
        <>
        <div className="container py-5">
            <h2 className="mb-4">Seu Carrinho</h2>
            <div className="list-group mb-4">
                { cart.map((item) => (
                    <div key={item.livroId} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="mb-1">{item.titulo}</h6>
                            <small className="text-muted">
                                { formatarPreco(parseFloat(item.price * item.quantidade)) }
                            </small>
                        </div>
                        <div>
                            { item.quantidade > 1 && (<button className="btn btn-light" onClick={() => diminuirQuantidade(item.livroId)}> <FaMinus/> </button> )}
                            <span>{item.quantidade}</span> 
                            <button className="btn btn-light" onClick={() => aumentarQuantidade(item.livroId)}> <FaPlus/> </button>
                          
                        </div>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => removeFromCart(item.livroId)}>
                            Remover
                        </button>
                    </div>          
                )) }
            </div> 

            <div className="d-flex justify-content-between align-items-center">
                <h5>Total :</h5>
                <h5>{formatarPreco(total)}</h5>
            </div>
            <div className="mt-4 text-end">
                <button className="btn btn-dark px-4" onClick={() => navigate('/checkout')}>
                    Finalizar Compra
                </button>
            </div>
        </div>
        </>
    )   
}