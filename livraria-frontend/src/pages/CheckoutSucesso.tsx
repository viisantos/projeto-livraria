import { Link } from 'react-router-dom'

export function CheckoutSucesso() {
    return (
        <div className="container vh-100 d-flex align-items-center justify-content-center">
            <div className="text-center p-5 shadow-sm rounded-4 bg-white" style={{ maxWidth: '500px' }}>
                <div className="mb-4">
                    <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justif-content-center"
                        style={{ width: '80px', height: '80px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-check-lg mx-auto" viewBox="0 0 16 16">
                            <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.42-6.446z"/>
                        </svg>
                    </div>
                </div>

                <h2 className="fw-bold mb-3"> Pagamento confirmado ! </h2>
                <p className="text-muted mb-4"> 
                    Recebemos o seu pedido. Em instantes, você receberá um email com os dados de acesso ao seu livro.
                </p> 
                <div className="d-grid gap-2">
                    <Link to="/" className="btn btn-dark py-2 rounded-3">
                        Voltar ao catálogo
                    </Link>
                    <Link to="/meus-pedidos" className="btn btn-link text-decoration-none text-muted">
                        Ver meus pedidos 
                    </Link>
                </div>
            </div>
        </div>
    )
}