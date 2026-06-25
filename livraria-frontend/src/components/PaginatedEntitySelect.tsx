import { useEffect, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import api from '../api/axios'
import type { PaginatedResponse } from '../types'

interface Item { id: number; nome: string }
interface Props { endpoint: string; id: string; label: string; name: string; value: string; onChange: (value: string) => void; error?: string; selectedLabel?: string }

export function PaginatedEntitySelect({ endpoint, id, label, name, value, onChange, error, selectedLabel }: Props) {
    const [itens, setItens] = useState<Item[]>([])
    const [pagina, setPagina] = useState(1)
    const [ultimaPagina, setUltimaPagina] = useState(1)

    useEffect(() => {
        api.get<PaginatedResponse<Item>>(endpoint, { params: { page: pagina, per_page: 50 } }).then((response) => {
            setItens(response.data.data)
            setUltimaPagina(response.data.meta.ultima_pagina)
        })
    }, [endpoint, pagina])

    const selecionadoNaoEstaNaPagina = value && !itens.some((item) => String(item.id) === value)

    return <div>
        <label htmlFor={id} className="form-label">{label}</label>
        <select id={id} name={name} className={'form-select ' + (error ? 'is-invalid' : '')} value={value} onChange={(event) => onChange(event.target.value)} required>
            <option value="">Selecione uma opção</option>
            {selecionadoNaoEstaNaPagina && selectedLabel && <option value={value}>{selectedLabel}</option>}
            {itens.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
        </select>
        {error && <div className="invalid-feedback">{error}</div>}
        <div className="d-flex justify-content-between align-items-center mt-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" title="Página anterior" disabled={pagina === 1} onClick={() => setPagina((atual) => atual - 1)}><FaChevronLeft /></button>
            <small className="text-muted">Página {pagina} de {ultimaPagina}</small>
            <button type="button" className="btn btn-outline-secondary btn-sm" title="Próxima página" disabled={pagina === ultimaPagina} onClick={() => setPagina((atual) => atual + 1)}><FaChevronRight /></button>
        </div>
    </div>
}
