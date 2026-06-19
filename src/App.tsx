import React, { useState, useMemo, useEffect } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { KpiCard } from './components/KpiCard'
import { Charts } from './components/Charts'
import { ContractsTable } from './components/ContractsTable'
import { useContracts } from './hooks/useContracts'
import type { Contract, YearSummary, ProviderSummary } from './types'

const fmt = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const fmtDate = (iso: string | null) => {
  if (!iso) return 'Nunca'
  return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
const fmtDateShort = (iso: string) => {
  try { return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return iso }
}

export default function App() {
  const { contracts, lastChecked, loading, error, refresh } = useContracts()

  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('theme', 'light')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const [filterYear, setFilterYear] = useState<number | null>(null)
  const [filterProvider, setFilterProvider] = useState<string | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)

  const handleYearClick = (year: number) => setFilterYear(prev => prev === year ? null : year)
  const handleProviderClick = (name: string) => setFilterProvider(prev => prev === name ? null : name)

  // All aggregations derive from filteredContracts
  const filteredContracts = useMemo(() =>
    contracts.filter(c =>
      (!filterYear || c.year === filterYear) &&
      (!filterProvider || c.adjudicatario === filterProvider)
    ), [contracts, filterYear, filterProvider])

  const yearSummaries = useMemo((): YearSummary[] => {
    const map = new Map<number, YearSummary>()
    for (const c of filteredContracts) {
      const existing = map.get(c.year) ?? { year: c.year, licitaciones: 0, adjudicaciones: 0, totalAmount: 0 }
      existing.licitaciones++
      if (['Adjudicada', 'Formalizada', 'Resuelta'].includes(c.status)) {
        existing.adjudicaciones++
        existing.totalAmount += c.amount
      }
      map.set(c.year, existing)
    }
    return Array.from(map.values()).sort((a, b) => a.year - b.year)
  }, [filteredContracts])

  const providerSummaries = useMemo((): ProviderSummary[] => {
    const map = new Map<string, ProviderSummary>()
    for (const c of filteredContracts) {
      if (!c.adjudicatario) continue
      const existing = map.get(c.adjudicatario) ?? { name: c.adjudicatario, contracts: 0, totalAmount: 0 }
      existing.contracts++
      existing.totalAmount += c.amount
      map.set(c.adjudicatario, existing)
    }
    return Array.from(map.values())
  }, [filteredContracts])

  const totalAdjudicado = useMemo(() =>
    filteredContracts
      .filter(c => ['Adjudicada', 'Formalizada', 'Resuelta'].includes(c.status))
      .reduce((sum, c) => sum + c.amount, 0),
    [filteredContracts])

  const contractsByType = useMemo(() =>
    filteredContracts.reduce<Record<string, number>>((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1
      return acc
    }, {}),
    [filteredContracts])

  const topProviderByAmount = providerSummaries.sort((a, b) => b.totalAmount - a.totalAmount)[0]

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo-mark">CP</div>
          <div>
            <h1>Contratació Pública</h1>
            <p>Ajuntament de Cullera · PLACSP</p>
          </div>
        </div>
        <div className="header-right">
          <span className="last-checked">
            Última actualización: {fmtDate(lastChecked)}
          </span>
          <button
            className="btn-theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
          <button className="btn-refresh" onClick={refresh} disabled={loading}>
            {loading ? (
              <span className="spinner" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 01-9 9m0-18a9 9 0 019 9M3 12a9 9 0 009 9m0-18a9 9 0 00-9 9"/>
                <path d="M3 12h2M19 12h2M12 3v2M12 19v2"/>
              </svg>
            )}
            Actualizar
          </button>
        </div>
      </header>

      <main className="main">
        {error && (
          <div className="banner banner-error">
            ⚠ Error al cargar datos: {error}
          </div>
        )}

        {/* KPIs */}
        <section className="kpi-grid">
          <KpiCard
            label="Total licitado"
            value={`${filteredContracts.length}`}
            sub={filterYear || filterProvider ? 'contratos filtrados' : 'contratos registrados'}
          />
          <KpiCard
            label="Total adjudicado"
            value={fmt.format(totalAdjudicado)}
            sub="importe acumulado"
            accent="#f5a524"
          />
          <KpiCard
            label="Año con mayor gasto"
            value={yearSummaries.length ? String(yearSummaries.reduce((a, b) => a.totalAmount > b.totalAmount ? a : b).year) : '—'}
            sub="pico de contratación"
          />
          <KpiCard
            label="Adjudicatario #1"
            value={topProviderByAmount?.name.split(' ')[0] || '—'}
            sub={topProviderByAmount ? fmt.format(topProviderByAmount.totalAmount) : ''}
          />
        </section>

        {/* Charts */}
        {contracts.length > 0 && (
          <Charts
            yearSummaries={yearSummaries}
            providerSummaries={providerSummaries}
            contractsByType={contractsByType}
            activeYear={filterYear}
            activeProvider={filterProvider}
            onYearClick={handleYearClick}
            onProviderClick={handleProviderClick}
          />
        )}

        {/* Active filter chips */}
        {(filterYear || filterProvider) && (
          <div className="filter-chips">
            <span className="filter-chips-label">Filtros activos:</span>
            {filterYear && (
              <button className="filter-chip" onClick={() => setFilterYear(null)}>
                {filterYear} <span>×</span>
              </button>
            )}
            {filterProvider && (
              <button className="filter-chip" onClick={() => setFilterProvider(null)}>
                {filterProvider} <span>×</span>
              </button>
            )}
            <button className="filter-chip-clear" onClick={() => { setFilterYear(null); setFilterProvider(null) }}>
              Limpiar todo
            </button>
          </div>
        )}

        {/* Contracts table */}
        <section className="section">
          <div className="section-header">
            <h2>Contratos</h2>
          </div>
          {contracts.length === 0 ? (
            <div className="empty-state">
              <p>{loading ? 'Cargando contratos…' : 'Aún no hay datos cargados.'}</p>
              <button className="btn-refresh" onClick={refresh} disabled={loading}>
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 01-9 9m0-18a9 9 0 019 9M3 12a9 9 0 009 9m0-18a9 9 0 00-9 9"/>
                    <path d="M3 12h2M19 12h2M12 3v2M12 19v2"/>
                  </svg>
                )}
                Actualizar
              </button>
            </div>
          ) : (
            <ContractsTable
              contracts={filteredContracts}
              onProviderClick={handleProviderClick}
              onContractClick={setSelectedContract}
            />
          )}
        </section>

        <footer className="footer">
          <p>Datos procedentes de PLACSP · <a href="https://contrataciondelestado.es" target="_blank" rel="noreferrer">contrataciondelestado.es</a></p>
        </footer>
      </main>

      {/* Contract detail modal */}
      {selectedContract && (
        <div className="modal-overlay" onClick={() => setSelectedContract(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-expediente">{selectedContract.expediente}</div>
                <h2 className="modal-title">{selectedContract.title}</h2>
              </div>
              <button className="modal-close" onClick={() => setSelectedContract(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-field">
                  <span className="detail-label">Estado</span>
                  <span className="detail-value">{selectedContract.status}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Tipo</span>
                  <span className="detail-value">{selectedContract.type}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Procedimiento</span>
                  <span className="detail-value">{selectedContract.procedure || '—'}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Importe licitación</span>
                  <span className="detail-value detail-amount">{selectedContract.amount > 0 ? fmt.format(selectedContract.amount) : '—'}</span>
                </div>
                {selectedContract.awardedAmount > 0 && (
                  <div className="detail-field">
                    <span className="detail-label">Importe adjudicación</span>
                    <span className="detail-value detail-amount">{fmt.format(selectedContract.awardedAmount)}</span>
                  </div>
                )}
                <div className="detail-field">
                  <span className="detail-label">Adjudicatario</span>
                  <span
                    className={`detail-value${selectedContract.adjudicatario ? ' detail-link' : ''}`}
                    onClick={() => {
                      if (selectedContract.adjudicatario) {
                        handleProviderClick(selectedContract.adjudicatario)
                        setSelectedContract(null)
                      }
                    }}
                  >
                    {selectedContract.adjudicatario || '—'}
                  </span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Publicado en plataforma</span>
                  <span className="detail-value">{fmtDateShort(selectedContract.publishedAt)}</span>
                </div>
                {selectedContract.submissionDeadline && (
                  <div className="detail-field">
                    <span className="detail-label">Fin plazo presentación</span>
                    <span className="detail-value">{fmtDateShort(selectedContract.submissionDeadline)}</span>
                  </div>
                )}
                {selectedContract.awardDate && (
                  <div className="detail-field">
                    <span className="detail-label">Adjudicación</span>
                    <span className="detail-value">{fmtDateShort(selectedContract.awardDate)}</span>
                  </div>
                )}
                {selectedContract.duration && (
                  <div className="detail-field">
                    <span className="detail-label">Duración</span>
                    <span className="detail-value">{selectedContract.duration}</span>
                  </div>
                )}
                {selectedContract.cpv && (
                  <div className="detail-field">
                    <span className="detail-label">CPV</span>
                    <span className="detail-value mono-sm">{selectedContract.cpv}</span>
                  </div>
                )}
              </div>
              {selectedContract.href && (
                <a className="modal-ext-link" href={selectedContract.href} target="_blank" rel="noreferrer">
                  Ver en contrataciondelestado.es →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
