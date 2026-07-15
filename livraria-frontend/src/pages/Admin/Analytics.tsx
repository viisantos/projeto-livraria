import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  FaChartLine,
  FaDownload,
  FaFileCsv,
  FaRedo,
  FaShoppingBag,
  FaStar,
  FaUsers,
} from 'react-icons/fa'
import api from '../../api/axios'

interface Kpi {
  rotulo: string
  valor: number
  anterior: number
  variacao_percentual: number | null
  formato: 'currency' | 'number' | 'percent'
}

interface VendaPeriodo {
  periodo: string
  receita: number
  pedidos: number
  itens: number
  ticket_medio: number
}

interface StatusPedido {
  status: string
  pedidos: number
  total: number
}

interface CategoriaReceita {
  categoria_id: number | null
  categoria: string
  unidades: number
  receita: number
}

interface LivroRanking {
  livro_id: number
  titulo: string
  autor: string | null
  unidades: number
  pedidos: number
  receita: number
}

interface ClienteRanking {
  cliente_id: number
  nome: string | null
  email: string | null
  pedidos: number
  receita: number
  ticket_medio: number
}

interface PedidoRecente {
  id: number
  cliente: string | null
  status: string
  total: number
  itens: number
  created_at: string
}

interface AnalyticsResponse {
  periodo: {
    inicio: string
    fim: string
    granularidade: 'dia' | 'mes'
  }
  comparativo: {
    inicio: string
    fim: string
  }
  kpis: Record<string, Kpi>
  series: {
    vendas_por_periodo: VendaPeriodo[]
    status_pedidos: StatusPedido[]
    receita_por_categoria: CategoriaReceita[]
  }
  rankings: {
    livros_mais_vendidos: LivroRanking[]
    clientes_mais_valiosos: ClienteRanking[]
  }
  pedidos_recentes: PedidoRecente[]
}

const kpiIcons: Record<string, ReactNode> = {
  receita: <FaChartLine />,
  pedidos_pagos: <FaShoppingBag />,
  ticket_medio: <FaStar />,
  itens_vendidos: <FaShoppingBag />,
  clientes_pagantes: <FaUsers />,
  taxa_recompra: <FaRedo />,
}

function dataInput(diasAtras = 0): string {
  const data = new Date()
  data.setDate(data.getDate() - diasAtras)
  return data.toISOString().slice(0, 10)
}

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function formatarNumero(valor: number): string {
  return new Intl.NumberFormat('pt-BR').format(valor)
}

function formatarValor(kpi: Kpi): string {
  if (kpi.formato === 'currency') return formatarMoeda(kpi.valor)
  if (kpi.formato === 'percent') return `${kpi.valor.toFixed(2).replace('.', ',')}%`
  return formatarNumero(kpi.valor)
}

function nomeArquivo(contentDisposition: string | undefined, padrao: string): string {
  const match = contentDisposition?.match(/filename="?([^"]+)"?/)
  return match?.[1] ?? padrao
}

function TrendChart({ dados }: { dados: VendaPeriodo[] }) {
  const largura = 720
  const altura = 260
  const margem = 34
  const maxReceita = Math.max(...dados.map((item) => item.receita), 1)
  const maxPedidos = Math.max(...dados.map((item) => item.pedidos), 1)
  const pontos = dados.map((item, index) => {
    const x = dados.length === 1 ? largura / 2 : margem + (index * (largura - margem * 2)) / (dados.length - 1)
    const y = altura - margem - (item.receita / maxReceita) * (altura - margem * 2)
    return `${x},${y}`
  })

  if (!dados.length) {
    return <div className="analytics-empty-chart">Sem vendas no período selecionado.</div>
  }

  return (
    <svg className="analytics-trend-chart" viewBox={`0 0 ${largura} ${altura}`} role="img" aria-label="Receita por período">
      {[0, 1, 2, 3].map((linha) => {
        const y = margem + (linha * (altura - margem * 2)) / 3
        return <line key={linha} x1={margem} x2={largura - margem} y1={y} y2={y} />
      })}

      {dados.map((item, index) => {
        const barWidth = Math.max(5, (largura - margem * 2) / Math.max(dados.length, 1) - 8)
        const x = margem + (index * (largura - margem * 2)) / Math.max(dados.length, 1) + 4
        const h = (item.pedidos / maxPedidos) * (altura - margem * 2)
        return (
          <rect
            key={item.periodo}
            className="analytics-orders-bar"
            x={x}
            y={altura - margem - h}
            width={barWidth}
            height={h}
            rx={4}
          />
        )
      })}

      <polyline points={pontos.join(' ')} />
      {pontos.map((ponto, index) => {
        const [x, y] = ponto.split(',').map(Number)
        return <circle key={`${ponto}-${index}`} cx={x} cy={y} r={4} />
      })}
    </svg>
  )
}

function HorizontalBars({ dados }: { dados: Array<{ label: string; value: number; helper: string }> }) {
  const max = Math.max(...dados.map((item) => item.value), 1)

  return (
    <div className="analytics-bars">
      {dados.map((item) => (
        <div className="analytics-bar-row" key={item.label}>
          <div className="analytics-bar-header">
            <span>{item.label}</span>
            <strong>{item.helper}</strong>
          </div>
          <div className="analytics-bar-track">
            <span style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Analytics() {
  const [inicio, setInicio] = useState(dataInput(89))
  const [fim, setFim] = useState(dataInput())
  const [dashboard, setDashboard] = useState<AnalyticsResponse | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [baixando, setBaixando] = useState<string | null>(null)

  const kpisPrincipais = useMemo(() => {
    if (!dashboard) return []
    return ['receita', 'pedidos_pagos', 'ticket_medio', 'itens_vendidos', 'clientes_pagantes', 'taxa_recompra']
      .map((chave) => [chave, dashboard.kpis[chave]] as const)
      .filter(([, kpi]) => Boolean(kpi))
  }, [dashboard])

  async function carregarDashboard(): Promise<void> {
    setCarregando(true)
    setErro('')

    try {
      const response = await api.get<AnalyticsResponse>('/admin/analytics', {
        params: { inicio, fim },
      })
      setDashboard(response.data)
    } catch (error) {
      console.error('Erro ao carregar analytics', error)
      setErro('Não foi possível carregar o dashboard de analytics.')
    } finally {
      setCarregando(false)
    }
  }

  async function baixarCsv(tipo: 'pedidos' | 'itens'): Promise<void> {
    setBaixando(tipo)

    try {
      const response = await api.get(`/admin/analytics/exportar/${tipo}`, {
        params: { inicio, fim },
        responseType: 'blob',
      })
      const arquivo = nomeArquivo(response.headers['content-disposition'], `analytics-${tipo}.csv`)
      const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8' }))
      const link = document.createElement('a')
      link.href = url
      link.download = arquivo
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar CSV', error)
      setErro('Não foi possível exportar o arquivo CSV.')
    } finally {
      setBaixando(null)
    }
  }

  useEffect(() => {
    carregarDashboard()
  }, [])

  if (carregando && !dashboard) {
    return <div className="d-flex justify-content-center py-5"><div className="spinner-border" role="status" /></div>
  }

  return (
    <div className="analytics-page">
      <header className="analytics-header">
        <div>
          <span className="analytics-eyebrow">Ecommerce analytics</span>
          <h1>Dashboard de vendas</h1>
          <p>Receita, pedidos, ebooks mais vendidos, clientes e exportações para Excel ou Power BI.</p>
        </div>

        <div className="analytics-filters">
          <label>
            Início
            <input type="date" value={inicio} onChange={(event) => setInicio(event.target.value)} />
          </label>
          <label>
            Fim
            <input type="date" value={fim} onChange={(event) => setFim(event.target.value)} />
          </label>
          <button className="btn btn-dark" onClick={carregarDashboard} disabled={carregando}>
            Atualizar
          </button>
        </div>
      </header>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {dashboard && (
        <>
          <section className="analytics-export-band">
            <div>
              <strong>Período analisado</strong>
              <span>{dashboard.periodo.inicio} até {dashboard.periodo.fim}</span>
            </div>
            <div className="analytics-export-actions">
              <button className="btn btn-outline-dark" onClick={() => baixarCsv('pedidos')} disabled={baixando !== null}>
                <FaFileCsv className="me-2" />
                {baixando === 'pedidos' ? 'Exportando...' : 'Pedidos CSV'}
              </button>
              <button className="btn btn-outline-dark" onClick={() => baixarCsv('itens')} disabled={baixando !== null}>
                <FaDownload className="me-2" />
                {baixando === 'itens' ? 'Exportando...' : 'Itens CSV'}
              </button>
            </div>
          </section>

          <section className="analytics-kpi-grid">
            {kpisPrincipais.map(([chave, kpi]) => (
              <article className="analytics-kpi-card" key={chave}>
                <div className="analytics-kpi-icon">{kpiIcons[chave] ?? <FaChartLine />}</div>
                <span>{kpi.rotulo}</span>
                <strong>{formatarValor(kpi)}</strong>
                <small className={kpi.variacao_percentual === null || kpi.variacao_percentual >= 0 ? 'text-success' : 'text-danger'}>
                  {kpi.variacao_percentual === null
                    ? 'Sem base anterior'
                    : `${kpi.variacao_percentual >= 0 ? '+' : ''}${kpi.variacao_percentual.toFixed(2).replace('.', ',')}% vs período anterior`}
                </small>
              </article>
            ))}
          </section>

          <section className="analytics-grid-main">
            <article className="analytics-panel analytics-panel-wide">
              <div className="analytics-panel-title">
                <div>
                  <h2>Receita e pedidos</h2>
                  <p>Barras representam pedidos; linha representa receita.</p>
                </div>
              </div>
              <TrendChart dados={dashboard.series.vendas_por_periodo} />
            </article>

            <article className="analytics-panel">
              <h2>Status dos pedidos</h2>
              <div className="analytics-status-list">
                {dashboard.series.status_pedidos.map((status) => (
                  <div key={status.status}>
                    <span className={`analytics-status-dot analytics-status-${status.status}`} />
                    <span>{status.status}</span>
                    <strong>{formatarNumero(status.pedidos)}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="analytics-panel analytics-panel-wide">
              <h2>Livros mais vendidos</h2>
              <HorizontalBars
                dados={dashboard.rankings.livros_mais_vendidos.map((livro) => ({
                  label: livro.titulo,
                  value: livro.unidades,
                  helper: `${formatarNumero(livro.unidades)} un. · ${formatarMoeda(livro.receita)}`,
                }))}
              />
            </article>

            <article className="analytics-panel">
              <h2>Receita por categoria</h2>
              <HorizontalBars
                dados={dashboard.series.receita_por_categoria.map((categoria) => ({
                  label: categoria.categoria,
                  value: categoria.receita,
                  helper: formatarMoeda(categoria.receita),
                }))}
              />
            </article>

            <article className="analytics-panel">
              <h2>Clientes mais valiosos</h2>
              <div className="analytics-table-wrap">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Pedidos</th>
                      <th>Receita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.rankings.clientes_mais_valiosos.map((cliente) => (
                      <tr key={cliente.cliente_id}>
                        <td>
                          <strong>{cliente.nome}</strong>
                          <span>{cliente.email}</span>
                        </td>
                        <td>{cliente.pedidos}</td>
                        <td>{formatarMoeda(cliente.receita)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="analytics-panel">
              <h2>Pedidos recentes</h2>
              <div className="analytics-table-wrap">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.pedidos_recentes.map((pedido) => (
                      <tr key={pedido.id}>
                        <td>
                          <strong>#{pedido.id}</strong>
                          <span>{pedido.cliente}</span>
                        </td>
                        <td><span className={`analytics-status-pill analytics-status-${pedido.status}`}>{pedido.status}</span></td>
                        <td>{formatarMoeda(pedido.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  )
}
