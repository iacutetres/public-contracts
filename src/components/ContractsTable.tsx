import React, { useState, useMemo } from 'react'
import type { Contract } from '../types'

interface ContractsTableProps {
  contracts: Contract[]
  onProviderClick?: (name: string) => void
  onContractClick?: (contract: Contract) => void
}

const fmt = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const fmtDate = (iso: string) => {
  try { return new Date(iso).toLocaleDateString('es-ES') } catch { return iso }
}

export function ContractsTable({ contracts, onProviderClick, onContractClick }: ContractsTableProps) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('Todos')
  const [filterStatus, setFilterStatus] = useState('Todos')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  const types = ['Todos', ...Array.from(new Set(contracts.map(c => c.type))).filter(Boolean).sort()]
  const statuses = ['Todos', ...Array.from(new Set(contracts.map(c => c.status))).filter(Boolean).sort()]

  const filtered = useMemo(() => {
    return contracts.filter(c => {
      const matchSearch = !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.adjudicatario?.toLowerCase().includes(search.toLowerCase()) ||
        c.expediente.toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === 'Todos' || c.type === filterType
      const matchStatus = filterStatus === 'Todos' || c.status === filterStatus
      return matchSearch && matchType && matchStatus
    }).sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
  }, [contracts, search, filterType, filterStatus])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const pageNumbers = useMemo(() => {
    const res: (number | string)[] = []
    for (let i = 0; i < totalPages; i++) {
      if (i === 0 || i === totalPages - 1 || (i >= safePage - 1 && i <= safePage + 1)) {
        res.push(i)
      } else if (res[res.length - 1] !== '…') {
        res.push('…')
      }
    }
    return res
  }, [totalPages, safePage])

  const statusColor: Record<string, string> = {
    'Formalizada': '#22c55e',
    'Adjudicada': '#3b82f6',
    'Publicada': '#f59e0b',
    'Preadjudicada': '#a78bfa',
    'Pendiente adjudicación': '#8b5cf6',
    'Resuelta': '#6dd6a0',
    'Anulada': '#ef4444',
  }

  return (
    <div className="table-section">
      <div className="table-filters">
        <input
          className="search-input"
          placeholder="Buscar por título, adjudicatario o expediente…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
        />
        <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(0) }}>
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(0) }}>
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="results-count">{filtered.length} contratos</span>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Expediente</th>
              <th>Título</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Adjudicatario</th>
              <th>Importe</th>
              <th>Publicado</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(c => (
              <tr key={c.id}>
                <td
                  className="mono clickable"
                  onClick={() => onContractClick?.(c)}
                  title="Ver detalle"
                >
                  {c.expediente}
                </td>
                <td className="title-cell" title={c.title}><span className="title-clamp">{c.title}</span></td>
                <td><span className="badge badge-type">{c.type}</span></td>
                <td>
                  <span
                    className="badge badge-status"
                    style={{ '--dot-color': statusColor[c.status] || '#94a3b8' } as React.CSSProperties}
                  >
                    {c.status}
                  </span>
                </td>
                <td
                  className={`provider-cell${c.adjudicatario ? ' clickable' : ''}`}
                  onClick={() => c.adjudicatario && onProviderClick?.(c.adjudicatario)}
                  title={c.adjudicatario ? `Filtrar por ${c.adjudicatario}` : undefined}
                >
                  <span className="provider-clamp">{c.adjudicatario || '—'}</span>
                </td>
                <td className="mono amount">{c.amount > 0 ? fmt.format(c.amount) : '—'}</td>
                <td className="mono date">{fmtDate(c.publishedAt)}</td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr><td colSpan={7} className="empty-row">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0}>←</button>
          {pageNumbers.map((p, i) =>
            p === '…'
              ? <span key={`e${i}`} className="page-ellipsis">…</span>
              : (
                <button
                  key={p}
                  className={`page-num${p === safePage ? ' active' : ''}`}
                  onClick={() => setPage(p as number)}
                >
                  {(p as number) + 1}
                </button>
              )
          )}
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage === totalPages - 1}>→</button>
        </div>
      )}
    </div>
  )
}
