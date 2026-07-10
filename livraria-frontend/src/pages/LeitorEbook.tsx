import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom'
import {
    FaArrowLeft,
    FaBookmark,
    FaBookOpen,
    FaChevronLeft,
    FaChevronRight,
    FaCog,
    FaHighlighter,
    FaMinus,
    FaPlus,
    FaRegBookmark,
    FaRegStickyNote,
    FaStickyNote,
    FaTrash,
} from 'react-icons/fa'
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'
import 'pdfjs-dist/web/pdf_viewer.css'
import api from '../api/axios'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

type TemaLeitura = 'claro' | 'sepia' | 'escuro'
type LarguraPagina = 'estreita' | 'confortavel' | 'ampla'
type PainelLeitor = 'exibicao' | 'anotacoes' | null
type TipoMarcacao = 'marcador' | 'nota' | 'destaque'
type TipoAnotacao = Exclude<TipoMarcacao, 'marcador'>

interface PreferenciasLeitor {
    tema: TemaLeitura
    zoom: number
    largura: LarguraPagina
}

interface RetanguloDestaque {
    left: number
    top: number
    width: number
    height: number
}

interface MarcacaoLeitor {
    id: number
    tipo: TipoMarcacao
    texto: string | null
    pagina: number
    cor: string | null
    retangulos?: RetanguloDestaque[] | null
    created_at?: string
}

interface MarcacoesResponse {
    data: MarcacaoLeitor[]
}

interface MarcacaoResponse {
    data: MarcacaoLeitor
}

const preferenciasPadrao: PreferenciasLeitor = {
    tema: 'claro',
    zoom: 100,
    largura: 'confortavel',
}

const coresDestaque = ['#fff2a8', '#ffd6a5', '#caffbf', '#bde0fe', '#ffc8dd']

function carregarPreferencias(chave: string): PreferenciasLeitor {
    try {
        const salvo = localStorage.getItem(chave)
        return salvo ? { ...preferenciasPadrao, ...JSON.parse(salvo) } : preferenciasPadrao
    } catch {
        return preferenciasPadrao
    }
}

export function LeitorEbook() {
    const { id } = useParams()
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const textLayerRef = useRef<HTMLDivElement | null>(null)
    const pageRef = useRef<HTMLDivElement | null>(null)
    const stageRef = useRef<HTMLElement | null>(null)
    const renderTaskRef = useRef<RenderTask | null>(null)
    const arrastePaginaRef = useRef({
        ativo: false,
        pointerId: null as number | null,
        inicioX: 0,
        inicioY: 0,
        scrollLeft: 0,
        scrollTop: 0,
    })

    const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null)
    const [totalPaginas, setTotalPaginas] = useState(0)
    const [carregando, setCarregando] = useState(true)
    const [renderizando, setRenderizando] = useState(false)
    const [erro, setErro] = useState('')
    const [erroMarcacoes, setErroMarcacoes] = useState('')
    const [painelAberto, setPainelAberto] = useState<PainelLeitor>('exibicao')
    const [preferencias, setPreferencias] = useState<PreferenciasLeitor>(() =>
        carregarPreferencias(`leitor:${id}:preferencias`)
    )
    const [marcacoes, setMarcacoes] = useState<MarcacaoLeitor[]>([])
    const [paginaAtual, setPaginaAtual] = useState(1)
    const [textoAnotacao, setTextoAnotacao] = useState('')
    const [tipoAnotacao, setTipoAnotacao] = useState<TipoAnotacao>('nota')
    const [corAnotacao, setCorAnotacao] = useState(coresDestaque[0])
    const [arrastandoPagina, setArrastandoPagina] = useState(false)

    useEffect(() => {
        let cancelado = false

        async function carregarPdf(): Promise<void> {
            setCarregando(true)
            setErro('')

            try {
                const response = await api.get('/biblioteca/livros/' + id + '/leitura', { responseType: 'blob' })
                const buffer = await (response.data as Blob).arrayBuffer()
                const documento = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise

                if (cancelado) return

                setPdfDocument(documento)
                setTotalPaginas(documento.numPages)
                setPaginaAtual(1)
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
                    try {
                        setErro((JSON.parse(await error.response.data.text()) as { message?: string }).message || 'Nao foi possivel carregar o ebook.')
                    } catch {
                        setErro('Nao foi possivel carregar o ebook.')
                    }
                    return
                }
                setErro('Nao foi possivel carregar o ebook.')
            } finally {
                if (!cancelado) setCarregando(false)
            }
        }

        carregarPdf()

        return () => {
            cancelado = true
            renderTaskRef.current?.cancel()
        }
    }, [id])

    useEffect(() => {
        let cancelado = false

        async function carregarMarcacoes(): Promise<void> {
            if (!id) return
            setErroMarcacoes('')

            try {
                const response = await api.get<MarcacoesResponse>('/biblioteca/livros/' + id + '/marcacoes')
                if (!cancelado) setMarcacoes(response.data.data)
            } catch {
                if (!cancelado) setErroMarcacoes('Nao foi possivel carregar suas marcacoes.')
            }
        }

        carregarMarcacoes()

        return () => {
            cancelado = true
        }
    }, [id])

    useEffect(() => {
        localStorage.setItem(`leitor:${id}:preferencias`, JSON.stringify(preferencias))
    }, [id, preferencias])

    useEffect(() => {
        let cancelado = false

        async function renderizarPagina(): Promise<void> {
            if (!pdfDocument || !canvasRef.current || !textLayerRef.current || !pageRef.current) return

            setRenderizando(true)
            renderTaskRef.current?.cancel()
            textLayerRef.current.replaceChildren()

            try {
                const page = await pdfDocument.getPage(paginaAtual)
                if (cancelado) return

                const scale = (preferencias.zoom / 100) * fatorLargura()
                const viewport = page.getViewport({ scale })
                const canvas = canvasRef.current
                const context = canvas.getContext('2d')
                const textLayer = textLayerRef.current
                const pageElement = pageRef.current

                if (!context) return

                const outputScale = window.devicePixelRatio || 1
                canvas.width = Math.floor(viewport.width * outputScale)
                canvas.height = Math.floor(viewport.height * outputScale)
                canvas.style.width = `${viewport.width}px`
                canvas.style.height = `${viewport.height}px`

                pageElement.style.width = `${viewport.width}px`
                pageElement.style.height = `${viewport.height}px`
                textLayer.style.width = `${viewport.width}px`
                textLayer.style.height = `${viewport.height}px`

                context.setTransform(outputScale, 0, 0, outputScale, 0, 0)
                context.clearRect(0, 0, viewport.width, viewport.height)

                const renderTask = page.render({ canvas, canvasContext: context, viewport })
                renderTaskRef.current = renderTask
                await renderTask.promise

                if (cancelado) return

                const textContent = await page.getTextContent()
                const camadaTexto = new pdfjsLib.TextLayer({
                    textContentSource: textContent,
                    container: textLayer,
                    viewport,
                })
                await camadaTexto.render()
            } catch (error) {
                if (!cancelado && !(error instanceof Error && error.name === 'RenderingCancelledException')) {
                    console.error('Erro ao renderizar PDF', error)
                    setErro('Nao foi possivel renderizar esta pagina.')
                }
            } finally {
                if (!cancelado) setRenderizando(false)
            }
        }

        renderizarPagina()

        return () => {
            cancelado = true
        }
    }, [pdfDocument, paginaAtual, preferencias.zoom, preferencias.largura])

    const marcadores = marcacoes.filter((marcacao) => marcacao.tipo === 'marcador')
    const anotacoes = marcacoes.filter((marcacao) => marcacao.tipo === 'nota' || marcacao.tipo === 'destaque')
    const paginaMarcada = marcadores.some((marcador) => marcador.pagina === paginaAtual)
    const destaquesDaPagina = marcacoes.filter((marcacao) =>
        marcacao.tipo === 'destaque' && marcacao.pagina === paginaAtual && marcacao.retangulos?.length
    )

    function fatorLargura(): number {
        switch (preferencias.largura) {
            case 'estreita': return 0.85
            case 'ampla': return 1.18
            default: return 1
        }
    }

    function alterarZoom(delta: number): void {
        setPreferencias((atuais) => ({
            ...atuais,
            zoom: Math.max(70, Math.min(220, atuais.zoom + delta)),
        }))
    }

    function alvoPreservaSelecao(alvo: EventTarget | null): boolean {
        if (!(alvo instanceof HTMLElement)) return false

        return Boolean(
            alvo.closest('button, a, input, textarea, select, [contenteditable="true"]') ||
            alvo.closest('.ebook-pdf-text-layer span')
        )
    }

    function iniciarArrastePagina(event: ReactPointerEvent<HTMLElement>): void {
        const stage = stageRef.current

        if (event.button !== 0 || event.pointerType !== 'mouse' || !stage || alvoPreservaSelecao(event.target)) {
            return
        }

        arrastePaginaRef.current = {
            ativo: true,
            pointerId: event.pointerId,
            inicioX: event.clientX,
            inicioY: event.clientY,
            scrollLeft: stage.scrollLeft,
            scrollTop: stage.scrollTop,
        }

        stage.setPointerCapture(event.pointerId)
        setArrastandoPagina(true)
        event.preventDefault()
    }

    function arrastarPagina(event: ReactPointerEvent<HTMLElement>): void {
        const arraste = arrastePaginaRef.current
        const stage = stageRef.current

        if (!arraste.ativo || arraste.pointerId !== event.pointerId || !stage) return

        stage.scrollLeft = arraste.scrollLeft - (event.clientX - arraste.inicioX)
        stage.scrollTop = arraste.scrollTop - (event.clientY - arraste.inicioY)
        event.preventDefault()
    }

    function finalizarArrastePagina(event: ReactPointerEvent<HTMLElement>): void {
        const arraste = arrastePaginaRef.current

        if (!arraste.ativo || arraste.pointerId !== event.pointerId) return

        stageRef.current?.releasePointerCapture(event.pointerId)
        arrastePaginaRef.current.ativo = false
        arrastePaginaRef.current.pointerId = null
        setArrastandoPagina(false)
    }

    function irParaPagina(pagina: number): void {
        if (!totalPaginas) {
            setPaginaAtual(Math.max(1, pagina))
            return
        }
        setPaginaAtual(Math.max(1, Math.min(totalPaginas, pagina)))
    }

    async function alternarMarcador(): Promise<void> {
        const marcadorExistente = marcadores.find((marcador) => marcador.pagina === paginaAtual)

        if (marcadorExistente) {
            setMarcacoes((atuais) => atuais.filter((marcacao) => marcacao.id !== marcadorExistente.id))

            try {
                await api.delete('/biblioteca/marcacoes/' + marcadorExistente.id)
            } catch {
                setErroMarcacoes('Nao foi possivel remover o marcador.')
                setMarcacoes((atuais) => [marcadorExistente, ...atuais])
            }
            return
        }

        try {
            const response = await api.post<MarcacaoResponse>('/biblioteca/livros/' + id + '/marcacoes', {
                tipo: 'marcador',
                pagina: paginaAtual,
            })
            setMarcacoes((atuais) => [response.data.data, ...atuais])
        } catch {
            setErroMarcacoes('Nao foi possivel salvar o marcador.')
        }
    }

    async function salvarAnotacao(): Promise<void> {
        const texto = textoAnotacao.trim()
        if (!texto) return

        try {
            const response = await api.post<MarcacaoResponse>('/biblioteca/livros/' + id + '/marcacoes', {
                tipo: tipoAnotacao,
                texto,
                pagina: paginaAtual,
                cor: tipoAnotacao === 'destaque' ? corAnotacao : '#ffffff',
            })
            setMarcacoes((atuais) => [response.data.data, ...atuais])
            setTextoAnotacao('')
            setPainelAberto('anotacoes')
        } catch {
            setErroMarcacoes('Nao foi possivel salvar a anotacao.')
        }
    }

    async function destacarSelecao(): Promise<void> {
        const selection = window.getSelection()
        const pageElement = pageRef.current
        const texto = selection?.toString().trim() ?? ''

        if (!selection || selection.rangeCount === 0 || !pageElement || !texto) {
            setTextoAnotacao('Selecione um trecho do texto renderizado para destacar.')
            return
        }

        const pageRect = pageElement.getBoundingClientRect()
        const retangulos = Array.from(selection.getRangeAt(0).getClientRects())
            .filter((rect) => rect.width > 0 && rect.height > 0)
            .map((rect) => ({
                left: (rect.left - pageRect.left) / pageRect.width,
                top: (rect.top - pageRect.top) / pageRect.height,
                width: rect.width / pageRect.width,
                height: rect.height / pageRect.height,
            }))

        if (!retangulos.length) return

        try {
            const response = await api.post<MarcacaoResponse>('/biblioteca/livros/' + id + '/marcacoes', {
                tipo: 'destaque',
                texto,
                pagina: paginaAtual,
                cor: corAnotacao,
                retangulos,
            })
            setMarcacoes((atuais) => [response.data.data, ...atuais])
            selection.removeAllRanges()
            setPainelAberto('anotacoes')
        } catch {
            setErroMarcacoes('Nao foi possivel salvar o destaque.')
        }
    }

    async function removerMarcacao(marcacaoId: number): Promise<void> {
        const marcacaoRemovida = marcacoes.find((marcacao) => marcacao.id === marcacaoId)
        setMarcacoes((atuais) => atuais.filter((marcacao) => marcacao.id !== marcacaoId))

        try {
            await api.delete('/biblioteca/marcacoes/' + marcacaoId)
        } catch {
            setErroMarcacoes('Nao foi possivel remover a marcacao.')
            if (marcacaoRemovida) setMarcacoes((atuais) => [marcacaoRemovida, ...atuais])
        }
    }

    function larguraConteudo(): string {
        switch (preferencias.largura) {
            case 'estreita': return '920px'
            case 'ampla': return '1440px'
            default: return '1160px'
        }
    }

    if (erro) {
        return (
            <div className="text-center py-5">
                <h3>Nao foi possivel abrir este ebook</h3>
                <p className="text-muted">{erro}</p>
                <Link className="btn btn-dark" to="/minha-biblioteca">Voltar a biblioteca</Link>
            </div>
        )
    }

    if (carregando || !pdfDocument) {
        return <div className="d-flex justify-content-center py-5"><div className="spinner-border" role="status" /></div>
    }

    return (
        <div className={`ebook-reader ebook-reader-${preferencias.tema}`}>
            <header className="ebook-reader-toolbar">
                <div className="d-flex align-items-center gap-2">
                    <Link className="btn btn-outline-secondary btn-sm" to="/minha-biblioteca" title="Voltar a biblioteca">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <div className="fw-semibold d-flex align-items-center gap-2">
                            <FaBookOpen />
                            Leitor
                        </div>
                        <small className="text-muted">Pagina {paginaAtual} de {totalPaginas}</small>
                    </div>
                </div>

                <div className="ebook-reader-actions">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => irParaPagina(paginaAtual - 1)} disabled={paginaAtual <= 1} title="Pagina anterior">
                        <FaChevronLeft />
                    </button>
                    <div className="input-group input-group-sm ebook-page-input">
                        <span className="input-group-text">Pagina</span>
                        <input
                            type="number"
                            min={1}
                            max={totalPaginas || undefined}
                            value={paginaAtual}
                            onChange={(event) => irParaPagina(Number(event.target.value) || 1)}
                            className="form-control"
                        />
                    </div>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => irParaPagina(paginaAtual + 1)} disabled={paginaAtual >= totalPaginas} title="Proxima pagina">
                        <FaChevronRight />
                    </button>
                    <button className={`btn btn-sm ${paginaMarcada ? 'btn-warning' : 'btn-outline-secondary'}`} onClick={alternarMarcador} title="Marcar pagina">
                        {paginaMarcada ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setPainelAberto(painelAberto === 'exibicao' ? null : 'exibicao')} title="Opcoes de exibicao">
                        <FaCog />
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setPainelAberto(painelAberto === 'anotacoes' ? null : 'anotacoes')} title="Anotacoes e destaques">
                        <FaStickyNote />
                    </button>
                </div>
            </header>

            <main className="ebook-reader-layout">
                <section
                    ref={stageRef}
                    className={`ebook-reader-stage${arrastandoPagina ? ' ebook-reader-stage-dragging' : ''}`}
                    onPointerDown={iniciarArrastePagina}
                    onPointerMove={arrastarPagina}
                    onPointerUp={finalizarArrastePagina}
                    onPointerCancel={finalizarArrastePagina}
                >
                    {erroMarcacoes && <div className="ebook-reader-warning alert alert-warning py-2 px-3">{erroMarcacoes}</div>}
                    <div className="ebook-reader-page-shell" style={{ maxWidth: larguraConteudo() }}>
                        {renderizando && <div className="ebook-reader-rendering"><div className="spinner-border spinner-border-sm" role="status" /></div>}
                        <div className="ebook-pdf-page" ref={pageRef}>
                            <canvas ref={canvasRef} className="ebook-pdf-canvas" />
                            <div className="ebook-reader-highlights">
                                {destaquesDaPagina.map((destaque) =>
                                    destaque.retangulos?.map((retangulo, index) => (
                                        <span
                                            key={`${destaque.id}-${index}`}
                                            className="ebook-reader-highlight"
                                            style={{
                                                left: `${retangulo.left * 100}%`,
                                                top: `${retangulo.top * 100}%`,
                                                width: `${retangulo.width * 100}%`,
                                                height: `${retangulo.height * 100}%`,
                                                backgroundColor: destaque.cor ?? coresDestaque[0],
                                            }}
                                        />
                                    ))
                                )}
                            </div>
                            <div ref={textLayerRef} className="textLayer ebook-pdf-text-layer" />
                        </div>
                    </div>
                </section>

                {painelAberto && (
                    <aside className="ebook-reader-panel">
                        {painelAberto === 'exibicao' && (
                            <>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0">Exibicao</h5>
                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setPainelAberto(null)}>Fechar</button>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Tema</label>
                                    <div className="btn-group w-100" role="group">
                                        {(['claro', 'sepia', 'escuro'] as TemaLeitura[]).map((tema) => (
                                            <button
                                                key={tema}
                                                type="button"
                                                className={`btn btn-sm ${preferencias.tema === tema ? 'btn-dark' : 'btn-outline-dark'}`}
                                                onClick={() => setPreferencias({ ...preferencias, tema })}
                                            >
                                                {tema}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Zoom</label>
                                    <div className="d-flex align-items-center gap-2">
                                        <button className="btn btn-outline-secondary btn-sm" onClick={() => alterarZoom(-10)}><FaMinus /></button>
                                        <input
                                            type="range"
                                            min={70}
                                            max={220}
                                            step={10}
                                            value={preferencias.zoom}
                                            onChange={(event) => setPreferencias({ ...preferencias, zoom: Number(event.target.value) })}
                                            className="form-range"
                                        />
                                        <button className="btn btn-outline-secondary btn-sm" onClick={() => alterarZoom(10)}><FaPlus /></button>
                                    </div>
                                    <small className="text-muted">{preferencias.zoom}%</small>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Largura da area</label>
                                    <div className="btn-group w-100" role="group">
                                        {(['estreita', 'confortavel', 'ampla'] as LarguraPagina[]).map((largura) => (
                                            <button
                                                key={largura}
                                                type="button"
                                                className={`btn btn-sm ${preferencias.largura === largura ? 'btn-dark' : 'btn-outline-dark'}`}
                                                onClick={() => setPreferencias({ ...preferencias, largura })}
                                            >
                                                {largura}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h6>Marcadores</h6>
                                    {marcadores.length === 0 && <p className="text-muted small">Nenhuma pagina marcada.</p>}
                                    <div className="d-flex flex-column gap-2">
                                        {marcadores.map((marcador) => (
                                            <button key={marcador.id} className="btn btn-outline-secondary btn-sm text-start" onClick={() => irParaPagina(marcador.pagina)}>
                                                <FaBookmark className="me-2" />
                                                Pagina {marcador.pagina}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {painelAberto === 'anotacoes' && (
                            <>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0">Anotacoes</h5>
                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setPainelAberto(null)}>Fechar</button>
                                </div>

                                <div className="border rounded p-3 mb-4 bg-light">
                                    <div className="btn-group w-100 mb-3" role="group">
                                        <button className={`btn btn-sm ${tipoAnotacao === 'nota' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setTipoAnotacao('nota')} type="button">
                                            <FaRegStickyNote className="me-1" />
                                            Nota
                                        </button>
                                        <button className={`btn btn-sm ${tipoAnotacao === 'destaque' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setTipoAnotacao('destaque')} type="button">
                                            <FaHighlighter className="me-1" />
                                            Destaque
                                        </button>
                                    </div>

                                    {tipoAnotacao === 'destaque' && (
                                        <>
                                            <div className="d-flex gap-2 mb-3">
                                                {coresDestaque.map((cor) => (
                                                    <button
                                                        key={cor}
                                                        type="button"
                                                        className={`ebook-highlight-color ${corAnotacao === cor ? 'active' : ''}`}
                                                        style={{ backgroundColor: cor }}
                                                        onClick={() => setCorAnotacao(cor)}
                                                        title="Cor do destaque"
                                                    />
                                                ))}
                                            </div>
                                            <button className="btn btn-outline-dark w-100 mb-3" onMouseDown={(event) => event.preventDefault()} onClick={destacarSelecao} type="button">
                                                <FaHighlighter className="me-2" />
                                                Destacar selecao
                                            </button>
                                        </>
                                    )}

                                    <textarea
                                        className="form-control mb-3"
                                        rows={4}
                                        value={textoAnotacao}
                                        onChange={(event) => setTextoAnotacao(event.target.value)}
                                        placeholder={tipoAnotacao === 'destaque' ? 'Ou descreva um trecho destacado' : 'Escreva sua anotacao'}
                                    />
                                    <button className="btn btn-dark w-100" onClick={salvarAnotacao} type="button">
                                        Salvar na pagina {paginaAtual}
                                    </button>
                                </div>

                                {anotacoes.length === 0 && <p className="text-muted small">Suas notas e destaques aparecerao aqui.</p>}
                                <div className="d-flex flex-column gap-3">
                                    {anotacoes.map((anotacao) => (
                                        <div key={anotacao.id} className="ebook-note" style={{ borderLeftColor: anotacao.cor ?? '#ffffff' }}>
                                            <div className="d-flex justify-content-between gap-2">
                                                <button className="btn btn-link p-0 text-dark text-decoration-none text-start" onClick={() => irParaPagina(anotacao.pagina)}>
                                                    <strong>{anotacao.tipo === 'destaque' ? 'Destaque' : 'Nota'}</strong>
                                                    <small className="text-muted d-block">Pagina {anotacao.pagina}</small>
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => removerMarcacao(anotacao.id)} title="Remover">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                            <p className="mb-0 mt-2">{anotacao.texto}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </aside>
                )}
            </main>
        </div>
    )
}
