import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { CheckoutForm } from  './CheckoutForm'
import api from '../api/axios'
import { useCart } from '../contexts/CartContext'
import type { AxiosError } from 'axios'


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

type ApiErrorResponse = {
    message?: string
}

function getApiErrorMessage(err: unknown): string | undefined {
    return (err as AxiosError<ApiErrorResponse>).response?.data?.message
}

export function CheckoutPage() {
    const navigate = useNavigate()
    const { cart } = useCart()
    const { clearCart } = useCart()
    const [clientSecret, setClientSecret] = useState('')
    const [sucesso, setSucesso] = useState(false)
    const [erroPagamento, setErroPagamento] = useState<string | null>(null)
    const [teste, setTeste] = useState({})
    const effectRan = useRef(false)

    const confirmarPagamento = async (paymentIntentId: string) => {
        try {
            const res = await api.post('/payment/confirm', {
                payment_intent_id: paymentIntentId
            })

            if(res.data.status === 'pago'){
                setErroPagamento(null)
                setSucesso(true)
                clearCart()

                setTimeout(() => {
                    navigate('/pedidos')
                }, 4000)

                return
            }

            setSucesso(false)
            setErroPagamento(
                res.data.message
                    ?? 'O pagamento ainda não foi confirmado. Confira seu histórico de pedidos antes de tentar pagar novamente.'
            )
        } catch (err) {
            console.error('Erro ao confirmar pagamento', err)
            setSucesso(false)
            setErroPagamento(
                getApiErrorMessage(err)
                    ?? 'Não foi possível confirmar o pagamento. Confira seu histórico de pedidos antes de tentar pagar novamente.'
            )
        }
    }

    useEffect(() => {
        
        if(cart.length === 0) return      
        
        if(effectRan.current === false){
            //const livroIds = cart.map(item => item.livroId)
            //api.post('/payment/intent', { livroIds: livroIds })

            api.post('/payment/intent', { livros: cart })  
            .then(res => {
                    setClientSecret(res.data.client_secret)
                    setTeste(res)
                })
            .catch(err =>{
                console.error('Erro ao gerar intenção de pagamento', err)
                const mensagemErro = getApiErrorMessage(err)
                    ?? 'Não foi possível concluir o pagamento. Tente novamente em alguns instantes.'

                setSucesso(false)
                setErroPagamento(mensagemErro)
            })

            console.log("client secret :", clientSecret)
            console.log("teste :", teste)
            console.log("Stripe Promise:", stripePromise)
            console.log("Sucesso :", sucesso)  
              
            
            return () => {
                effectRan.current = true
            }
           
        }
    }, [cart])

    if(sucesso || erroPagamento){
        return(
            <div className="text-center py-5">
                {sucesso && (
                    <>
                        <h2>Pagamento Realizado com sucesso! 🎉</h2>
                        <p>Redirecionando para seus pedidos...</p>
                    </>
                )}

                {erroPagamento && (
                    <>
                        <h2>Não foi possível concluir o pagamento</h2>
                        <p>{erroPagamento}</p>
                        <button className="btn btn-dark mt-3" onClick={() => navigate('/')}>
                            Voltar para o catálogo
                        </button>
                    </>
                )}
            </div>)
    }

    if(cart.length === 0){
        return <p className="text-center mt-5"> Seu carrinho está vazio </p> 
    }

    return (
        <div className="container py-5" style={{ maxWidth: '500px' }}>
            <h2 className="mb-4"> Finalizar compra </h2>
            { clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm clientSecret={clientSecret} onSuccess={confirmarPagamento}/>
                </Elements> 
            ):(
                <div className="text-center"> Carregando checkout... </div>
            )} 
        </div>
    )
}
