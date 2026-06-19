export interface Contract {
  id: string
  title: string
  amount: number
  awardedAmount: number
  status: string
  type: string
  procedure: string
  publishedAt: string
  submissionDeadline?: string
  awardDate?: string
  duration?: string
  adjudicatario?: string
  adjudicatarioNif?: string
  expediente: string
  cpv?: string
  cpvDescription?: string
  href?: string
  year: number
}

export interface YearSummary {
  year: number
  licitaciones: number
  adjudicaciones: number
  totalAmount: number
}

export interface ProviderSummary {
  name: string
  nif?: string
  contracts: number
  totalAmount: number
}

export interface AppState {
  contracts: Contract[]
  lastChecked: string | null
  knownIds: string[]
}
