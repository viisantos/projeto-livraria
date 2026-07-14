import { useState, type FormEvent } from 'react'
import {
    useStripe,
    useElements,
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
} from '@stripe/react-stripe-js'
import { FaCreditCard, FaLock } from 'react-icons/fa'

export interface DadosCartaoCheckout {
    nome_no_cartao: string
    pais_cartao: string
}

interface CheckoutFormProps {
    clientSecret: string
    total: number
    onSuccess: (paymentIntentId: string, dadosCartao: DadosCartaoCheckout) => Promise<void> | void
}

function formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(valor)
}

const stripeElementStyle = {
    base: {
        color: '#202123',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
        '::placeholder': {
            color: '#8e8ea0',
        },
    },
    invalid: {
        color: '#b42318',
        iconColor: '#b42318',
    },
}

const paisesCartao = [
    { codigo: 'BR', nome: 'Brasil' },
    { codigo: 'US', nome: 'Estados Unidos' },
    { codigo: 'PT', nome: 'Portugal' },
    { codigo: 'AR', nome: 'Argentina' },
    { codigo: 'CL', nome: 'Chile' },
    { codigo: 'CO', nome: 'Colômbia' },
    { codigo: 'MX', nome: 'México' },
    { codigo: 'UY', nome: 'Uruguai' },
]

const bandeirasCartao = [
    {
        nome: 'Visa',
        src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Visa_Inc._logo.svg',
    },
    {
        nome: 'Mastercard',
        src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mastercard-logo.svg',
    },
    {
        nome: 'American Express',
        src: 'https://commons.wikimedia.org/wiki/Special:FilePath/American_Express_logo_(2018).svg',
    },
    {
        nome: 'Elo',
        src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Logotipo_da_Elo.svg',
    },
]

export function CheckoutForm({ clientSecret, total, onSuccess }: CheckoutFormProps) {
    const stripe = useStripe()
    const elements = useElements()
    const [processando, setProcessando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [nomeNoCartao, setNomeNoCartao] = useState('')
    const [paisCartao, setPaisCartao] = useState('BR')

    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault()
        if (!stripe || !elements) return

        const nomeTratado = nomeNoCartao.trim()

        if (!nomeTratado) {
            setErro('Informe o nome como aparece no cartão.')
            return
        }

        setProcessando(true)
        setErro(null)

        const cardNumberElement = elements.getElement(CardNumberElement)

        if (!cardNumberElement) {
            setErro('Não foi possível carregar o formulário do cartão.')
            setProcessando(false)
            return
        }

        const dadosCartao: DadosCartaoCheckout = {
            nome_no_cartao: nomeTratado,
            pais_cartao: paisCartao,
        }

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardNumberElement,
                billing_details: {
                    name: nomeTratado,
                    address: {
                        country: paisCartao,
                    },
                },
            },
        })

        if (result.error) {
            setErro(result.error.message ?? 'Erro desconhecido')
            setProcessando(false)
            return
        }

        if (result.paymentIntent.status === 'succeeded') {
            try {
                await onSuccess(result.paymentIntent.id, dadosCartao)
            } catch {
                setErro('Pagamento recebido, mas não foi possível confirmar o pedido agora.')
                setProcessando(false)
            }
            return
        }

        setErro('O pagamento ainda não foi concluído. Tente novamente em alguns instantes.')
        setProcessando(false)
    }

    return (
        <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-form-header">
                <div className="checkout-icon-box">
                    <FaCreditCard />
                </div>
                <div>
                    <h2>Pagamento</h2>
                    <p>Informe os dados do cartão para liberar seus ebooks.</p>
                </div>
            </div>

            <div className="checkout-field-group">
                <label htmlFor="nome_no_cartao" className="checkout-label">Nome no cartão</label>
                <input
                    id="nome_no_cartao"
                    type="text"
                    className="checkout-text-input"
                    value={nomeNoCartao}
                    onChange={(event) => setNomeNoCartao(event.target.value)}
                    placeholder="Nome impresso no cartão"
                    autoComplete="cc-name"
                    required
                />
            </div>

            <div className="checkout-field-group">
                <label className="checkout-label">Dados do cartão</label>
                <div className="checkout-card-box">
                    <div className="checkout-card-number-row">
                        <div className="checkout-stripe-field">
                            <CardNumberElement
                                options={{
                                    showIcon: false,
                                    placeholder: '1234 1234 1234 1234',
                                    style: stripeElementStyle,
                                }}
                            />
                        </div>
                        <div className="checkout-card-brands" aria-label="Bandeiras aceitas">
                            {bandeirasCartao.map((bandeira) => (
                                <img
                                    key={bandeira.nome}
                                    src={bandeira.src}
                                    alt={bandeira.nome}
                                    title={bandeira.nome}
                                    className="checkout-card-brand-img"
                                    loading="lazy"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="checkout-card-details-row">
                        <div className="checkout-stripe-field">
                            <CardExpiryElement
                                options={{
                                    placeholder: 'MM / AA',
                                    style: stripeElementStyle,
                                }}
                            />
                        </div>
                        <div className="checkout-stripe-field">
                            <CardCvcElement
                                options={{
                                    placeholder: 'CVC',
                                    style: stripeElementStyle,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="checkout-field-group">
                <label htmlFor="pais_cartao" className="checkout-label">País ou região</label>
                <select
                    id="pais_cartao"
                    className="checkout-select"
                    value={paisCartao}
                    onChange={(event) => setPaisCartao(event.target.value)}
                    autoComplete="billing country"
                >
                    {paisesCartao.map((pais) => (
                        <option key={pais.codigo} value={pais.codigo}>
                            {pais.nome}
                        </option>
                    ))}
                </select>
            </div>

            {erro && <div className="checkout-error-alert">{erro}</div>}

            <button disabled={!stripe || processando} className="checkout-pay-button">
                {processando ? 'Processando...' : `Pagar ${formatarPreco(total)}`}
            </button>

            <p className="checkout-secure-note">
                <FaLock />
                Pagamento seguro processado pelo Stripe.
            </p>
        </form>
    )
}
