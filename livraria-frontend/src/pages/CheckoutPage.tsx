import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { CheckoutForm } from  './CheckoutForm'
import api from '../api/axios'
import { useCart } from '../contexts/CartContext'


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export function CheckoutPage() {
    const navigate = useNavigate()
    const { cart } = useCart()
    const { clearCart } = useCart()
    const [clientSecret, setClientSecret] = useState('')
    const [sucesso, setSucesso] = useState(false)
    const [erroPagamento, setErroPagamento] = useState<string | null>(null)
    const [teste, setTeste] = useState({})
    const effectRan = useRef(false)

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
                const mensagemErro = err.response?.data?.message
                    ?? 'Não foi possível concluir o pagamento. Tente novamente em alguns instantes.'

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

    if(cart.length === 0){
        return <p className="text-center mt-5"> Seu carrinho está vazio </p> 
    }
    
    if(sucesso){
        return(
            <div className="text-center py-5">
                <h2>Pagamento Realizado com sucesso! 🎉</h2>
                <p>Redirecionando para seus pedidos...</p>
            </div>)
    }

    if(erroPagamento){
        return(
            <div className="text-center py-5">
                <h2>Não foi possível concluir o pagamento</h2>
                <p>{erroPagamento}</p>
            </div>)
    }

    return (
        <div className="container py-5" style={{ maxWidth: '500px' }}>
            <h2 className="mb-4"> Finalizar compra </h2>
            { clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm clientSecret={clientSecret} onSuccess={
                        () => {clearCart()
                           setSucesso(true)
                           setTimeout(() => { 
                            navigate('/pedidos')
                           }, 2000)

                        }}/>
                </Elements> 
            ):(
                <div className="text-center"> Carregando checkout... </div>
            )} 
        </div>
    )
}

