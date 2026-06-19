import React from 'react'

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  accent?: string
}

export function KpiCard({ label, value, sub, accent }: KpiCardProps) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={accent ? { color: accent } : undefined}>{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  )
}
