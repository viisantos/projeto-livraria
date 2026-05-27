import { useState } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'

interface CheckoutFormProps {
    clientSecret: string;
    onSuccess: (paymentIntentId: string) => Promise<void> | void;  
}

export function CheckoutForm({ clientSecret, onSuccess }: CheckoutFormProps) {
    const stripe = useStripe()
    const elements = useElements()
    const [processando, setProcessando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if(!stripe || !elements) return
        
        setProcessando(true)
        setErro(null)
        
        const cardElement = elements.getElement(CardElement)
        
        if(!cardElement) {
            setErro('Não foi possível carregar o formulário do cartão.')
            setProcessando(false)
            return
        }

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
            },
        })

        if(result.error) {
            setErro(result.error.message ?? 'Erro desconhecido');
            setProcessando(false)
        }else{
            if(result.paymentIntent.status === 'succeeded'){
                try {
                    await onSuccess(result.paymentIntent.id)
                } catch {
                    setErro('Pagamento recebido, mas não foi possível confirmar o pedido agora.')
                    setProcessando(false)
                }
            }else{
                setErro('O pagamento ainda não foi concluído. Tente novamente em alguns instantes.')
                setProcessando(false)
            }
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="p-3 border rounded bg-light">
                <div className="mb-4">
                    <label className="form-label">Informações do Cartão</label>
                    <div className="p-3 bg-white border rounded">
                        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
                    </div>
                </div>

                { erro && <div className="alert alert-danger"> { erro } </div>}

                <button disabled={ !stripe || processando } className="btn btn-dark w-100 py-2">
                    { processando ? 'Processando...' : 'Pagar Agora' }
                </button>
            </form>
        </>
    )
}
