import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { YearSummary, ProviderSummary } from '../types'

const fmt = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M€`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k€`
  return `${v}€`
}

const COLORS = ['#f5a524', '#38bdf8', '#6dd6a0', '#f472b6', '#a78bff', '#4c9be8', '#fbbf24']

interface ChartsProps {
  yearSummaries: YearSummary[]
  providerSummaries: ProviderSummary[]
  contractsByType: Record<string, number>
  activeYear?: number | null
  activeProvider?: string | null
  onYearClick?: (year: number) => void
  onProviderClick?: (name: string) => void
}

export function Charts({
  yearSummaries, providerSummaries, contractsByType,
  activeYear, activeProvider, onYearClick, onProviderClick,
}: ChartsProps) {
  const [topMode, setTopMode] = useState<'amount' | 'count'>('amount')
  const pieData = Object.entries(contractsByType).map(([name, value]) => ({ name, value }))

  const sortedProviders = [...providerSummaries]
    .sort((a, b) => topMode === 'amount' ? b.totalAmount - a.totalAmount : b.contracts - a.contracts)
    .slice(0, 7)

  return (
    <div className="charts-grid">
      {/* Year evolution */}
      <div className="chart-card wide">
        <h3>Evolución anual del gasto adjudicado {activeYear && <span className="chart-active-label">· {activeYear} activo — clic para quitar</span>}</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={yearSummaries}
            margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
            onClick={(e) => {
              if (e?.activePayload?.[0]) {
                const year = e.activePayload[0].payload.year as number
                onYearClick?.(year)
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.18)" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#888' }} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: '#888' }} width={52} />
            <Tooltip
              formatter={(v: number) => [fmt(v), 'Adjudicado']}
              contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="totalAmount" radius={[4, 4, 0, 0]}>
              {yearSummaries.map((entry) => (
                <Cell
                  key={entry.year}
                  fill={activeYear === entry.year ? '#fbbf24' : '#f5a524'}
                  opacity={activeYear && activeYear !== entry.year ? 0.4 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Contract type pie */}
      <div className="chart-card">
        <h3>Por tipo de contrato</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <Pie
              data={pieData}
              cx="50%"
              cy="42%"
              innerRadius={48}
              outerRadius={76}
              dataKey="value"
              paddingAngle={3}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: 12 }}
              formatter={(v) => <span style={{ fontSize: 12, color: '#888' }}>{v}</span>}
            />
            <Tooltip
              contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top providers */}
      <div className="chart-card">
        <div className="chart-card-header">
          <h3>Top adjudicatarios</h3>
          <div className="top-toggle">
            <button className={topMode === 'amount' ? 'active' : ''} onClick={() => setTopMode('amount')}>€</button>
            <button className={topMode === 'count' ? 'active' : ''} onClick={() => setTopMode('count')}>#</button>
          </div>
        </div>
        <div className="provider-list">
          {sortedProviders.map((p, i) => {
            const max = topMode === 'amount'
              ? (sortedProviders[0]?.totalAmount || 1)
              : (sortedProviders[0]?.contracts || 1)
            const isActive = activeProvider === p.name
            return (
              <div
                key={p.name}
                className={`provider-row${isActive ? ' provider-row-active' : ''}`}
                onClick={() => onProviderClick?.(p.name)}
                title={p.name}
              >
                <span className="provider-rank">{i + 1}</span>
                <div className="provider-info">
                  <div className="provider-name">{p.name}</div>
                  <div className="provider-bar-track">
                    <div
                      className="provider-bar-fill"
                      style={{ width: `${((topMode === 'amount' ? p.totalAmount : p.contracts) / max) * 100}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
                <span className="provider-count">{topMode === 'amount' ? fmt(p.totalAmount) : p.contracts}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
