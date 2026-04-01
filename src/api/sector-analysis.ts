import type { CompanyFinancials } from '../types/financial'

export function groupBySector(companies: CompanyFinancials[]): Record<string, CompanyFinancials[]> {
  return companies.reduce<Record<string, CompanyFinancials[]>>((acc, company) => {
    const sector = company.company.sector ?? 'Unknown'
    return {
      ...acc,
      [sector]: [...(acc[sector] ?? []), company],
    }
  }, {})
}

export function filterBySector(companies: CompanyFinancials[], sector: string): CompanyFinancials[] {
  return companies.filter(c => c.company.sector === sector)
}
