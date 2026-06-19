import type { Contract } from '../types'
import { config } from '../config'

const API_BASE = '/digitalvalue-api/contratacionestado/api.php'

interface ApiContract {
  id: string
  cid: string
  title: string
  budgetamount: string
  awardedamount: string
  status: string
  typecode: string
  procedurecode: string
  updated: string
  issuedate: string | null
  enddate: string | null
  tendersubmissiondeadline: string | null
  awarddate: string | null
  durationmeasure: string | null
  durationmeasureunit: string | null
  winningparty: string | null
  cpv: string | null
  href: string
  contractingpartyid: string
  countrysubentity: string
  fundingprogram: string
}

export async function fetchCulleraContracts(): Promise<Contract[]> {
  const response = await fetch(`${API_BASE}/contratacion/${config.dir3}`, {
    signal: AbortSignal.timeout(20000),
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

  const data: ApiContract[] = await response.json()

  if (!Array.isArray(data)) throw new Error('La respuesta no es un array válido')
  if (data.length === 0) throw new Error('La API no devolvió contratos')

  return data.map(mapContract)
}

function mapContract(c: ApiContract): Contract {
  const amount = parseFloat(c.budgetamount) || 0
  const awardedAmount = parseFloat(c.awardedamount) || 0
  const publishedAt = c.issuedate || c.updated || ''
  const year = publishedAt ? new Date(publishedAt).getFullYear() : new Date().getFullYear()

  return {
    id: c.cid || c.id,
    title: c.title,
    amount,
    awardedAmount,
    status: mapStatus(c.status),
    type: mapContractType(c.typecode),
    procedure: mapProcedure(c.procedurecode),
    publishedAt,
    submissionDeadline: c.tendersubmissiondeadline || c.enddate || undefined,
    awardDate: c.awarddate || undefined,
    duration: formatDuration(c.durationmeasure, c.durationmeasureunit),
    adjudicatario: c.winningparty || undefined,
    expediente: c.id,
    cpv: c.cpv || undefined,
    href: c.href || undefined,
    year,
  }
}

function formatDuration(measure: string | null, unit: string | null): string | undefined {
  const n = parseFloat(measure || '')
  if (!n) return undefined
  const units: Record<string, [string, string]> = {
    DAY: ['día', 'días'],
    MON: ['mes', 'meses'],
    ANN: ['año', 'años'],
    YEA: ['año', 'años'],
    WEE: ['semana', 'semanas'],
    HOU: ['hora', 'horas'],
  }
  const [sing, plur] = units[(unit || '').toUpperCase()] || ['', '']
  if (!sing) return `${n} ${unit || ''}`.trim()
  return `${n} ${n === 1 ? sing : plur}`
}

function mapStatus(code: string): string {
  const map: Record<string, string> = {
    PUB: 'Publicada',
    ADJ: 'Adjudicada',
    FOR: 'Formalizada',
    EV: 'En plazo',
    PRE: 'Preadjudicada',
    PEN: 'Pendiente adjudicación',
    RES: 'Resuelta',
    ANU: 'Anulada',
    DEP: 'Archivada',
  }
  return map[code?.toUpperCase()] || code || 'Desconocido'
}

function mapContractType(code: string): string {
  const map: Record<string, string> = {
    '1': 'Obras',
    '2': 'Servicios',
    '3': 'Suministros',
    '4': 'Concesión obras',
    '5': 'Concesión servicios',
    '7': 'Administrativo especial',
    '8': 'Privado',
    '21': 'Obras',
    '22': 'Servicios',
    '23': 'Suministros',
    '31': 'Colaboración público-privada',
    '32': 'Concesión obras',
    '40': 'Concesión servicios',
    '50': 'Patrimonial',
  }
  return map[code] || code || 'N/D'
}

function mapProcedure(code: string): string {
  const map: Record<string, string> = {
    '1': 'Abierto',
    '2': 'Restringido',
    '3': 'Negociado',
    '4': 'Diálogo competitivo',
    '5': 'Abierto simplificado',
    '6': 'Menor',
    '100': 'Menor',
    '200': 'Basado acuerdo marco',
  }
  return map[code] || code || 'N/D'
}
