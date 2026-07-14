import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import {
    FaArrowLeft,
    FaCheckCircle,
    FaExclamationCircle,
    FaLock,
    FaReceipt,
    FaShieldAlt,
    FaShoppingBag,
} from 'react-icons/fa'
import { CheckoutForm, type DadosCartaoCheckout } from './CheckoutForm'
import api from '../api/axios'
import { useCart } from '../contexts/CartContext'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

type ApiErrorResponse = {
    message?: string
}

function getApiErrorMessage(err: unknown): string | undefined {
    if (axios.isAxiosError<ApiErrorResponse>(err)) {
        return err.response?.data?.message
    }

    return undefined
}

function formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(valor)
}

export function CheckoutPage() {
    const navigate = useNavigate()
    const { cart, clearCart, total } = useCart()
    const [clientSecret, setClientSecret] = useState('')
    const [sucesso, setSucesso] = useState(false)
    const [erroPagamento, setErroPagamento] = useState<string | null>(null)
    const intentCriadoRef = useRef(false)

    async function confirmarPagamento(paymentIntentId: string, dadosCartao: DadosCartaoCheckout): Promise<void> {
        try {
            const res = await api.post('/payment/confirm', {
                payment_intent_id: paymentIntentId,
                ...dadosCartao,
            })

            if (res.data.status === 'pago') {
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
        if (cart.length === 0 || intentCriadoRef.current) return

        intentCriadoRef.current = true
        setErroPagamento(null)

        api.post('/payment/intent', { livros: cart })
            .then((res) => {
                setClientSecret(res.data.client_secret)
            })
            .catch((err) => {
                console.error('Erro ao gerar intenção de pagamento', err)
                const mensagemErro = getApiErrorMessage(err)
                    ?? 'Não foi possível iniciar o pagamento. Tente novamente em alguns instantes.'

                setSucesso(false)
                setErroPagamento(mensagemErro)
            })
    }, [cart])

    if (sucesso || erroPagamento) {
        return (
            <main className="checkout-shell checkout-feedback-shell">
                <section className={`checkout-feedback ${sucesso ? 'checkout-feedback-success' : 'checkout-feedback-error'}`}>
                    <div className="checkout-feedback-icon">
                        {sucesso ? <FaCheckCircle /> : <FaExclamationCircle />}
                    </div>

                    {sucesso && (
                        <>
                            <h1>Pagamento realizado com sucesso!</h1>
                            <p>Seu pedido foi confirmado. Vamos redirecionar você para seus pedidos.</p>
                        </>
                    )}

                    {erroPagamento && (
                        <>
                            <h1>Não foi possível concluir o pagamento</h1>
                            <p>{erroPagamento}</p>
                            <div className="checkout-feedback-actions">
                                <button className="btn btn-dark" onClick={() => navigate('/checkout')}>
                                    Tentar novamente
                                </button>
                                <button className="btn btn-outline-dark" onClick={() => navigate('/carrinho')}>
                                    Voltar ao carrinho
                                </button>
                            </div>
                        </>
                    )}
                </section>
            </main>
        )
    }

    if (cart.length === 0) {
        return (
            <main className="checkout-shell checkout-feedback-shell">
                <section className="checkout-feedback">
                    <div className="checkout-feedback-icon">
                        <FaShoppingBag />
                    </div>
                    <h1>Seu carrinho está vazio</h1>
                    <p>Escolha seus ebooks favoritos para continuar a compra.</p>
                    <Link className="btn btn-dark" to="/">
                        Voltar ao catálogo
                    </Link>
                </section>
            </main>
        )
    }

    return (
        <main className="checkout-shell">
            <div className="checkout-container">
                <section className="checkout-payment-panel">
                    <Link to="/carrinho" className="checkout-back-link">
                        <FaArrowLeft />
                        Carrinho
                    </Link>

                    <div className="checkout-title-block">
                        <span className="checkout-eyebrow">Finalizar compra</span>
                        <h1>Complete seu pagamento</h1>
                        <p>Compra digital com acesso aos ebooks liberado após a confirmação.</p>
                    </div>

                    {clientSecret ? (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <CheckoutForm clientSecret={clientSecret} total={total} onSuccess={confirmarPagamento} />
                        </Elements>
                    ) : (
                        <div className="checkout-loading">
                            <div className="spinner-border spinner-border-sm" role="status" />
                            Preparando checkout seguro...
                        </div>
                    )}
                </section>

                <aside className="checkout-summary-panel" aria-label="Resumo da compra">
                    <div className="checkout-summary-header">
                        <div>
                            <span className="checkout-eyebrow">Resumo</span>
                            <h2>Seu pedido</h2>
                        </div>
                        <div className="checkout-summary-icon">
                            <FaReceipt />
                        </div>
                    </div>

                    <div className="checkout-items">
                        {cart.map((item) => (
                            <div className="checkout-item" key={item.livroId}>
                                <div className="checkout-item-cover" aria-hidden="true">
                                    {item.titulo.charAt(0)}
                                </div>
                                <div className="checkout-item-info">
                                    <strong>{item.titulo}</strong>
                                    <span>Ebook</span>
                                </div>
                                <span className="checkout-item-price">{formatarPreco(Number(item.price))}</span>
                            </div>
                        ))}
                    </div>

                    <div className="checkout-summary-lines">
                        <div>
                            <span>Subtotal</span>
                            <strong>{formatarPreco(total)}</strong>
                        </div>
                        <div>
                            <span>Entrega digital</span>
                            <strong>Grátis</strong>
                        </div>
                    </div>

                    <div className="checkout-total-line">
                        <span>Total</span>
                        <strong>{formatarPreco(total)}</strong>
                    </div>

                    <div className="checkout-trust-list">
                        <div>
                            <FaLock />
                            <span>Pagamento criptografado</span>
                        </div>
                        <div>
                            <FaShieldAlt />
                            <span>Processamento seguro via Stripe</span>
                        </div>
                        <div>
                            <FaCheckCircle />
                            <span>Acesso liberado após confirmação</span>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    )
}
