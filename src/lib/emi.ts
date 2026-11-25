export interface EmiResult {
  emi: number
  totalInterest: number
  totalPayment: number
  months: number
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

/**
 * Reducing-balance EMI: EMI = P × r × (1+r)^n / ((1+r)^n − 1),
 * where r is the monthly rate and n the number of monthly instalments.
 * A zero rate falls back to P / n.
 */
export function calculateEmi(principal: number, annualRatePercent: number, months: number): EmiResult {
  if (!(principal > 0) || !(months > 0) || annualRatePercent < 0) {
    return { emi: 0, totalInterest: 0, totalPayment: 0, months: 0 }
  }
  const r = annualRatePercent / 12 / 100
  const emiRaw = r === 0 ? principal / months : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
  const totalPayment = emiRaw * months
  return {
    emi: round2(emiRaw),
    totalPayment: round2(totalPayment),
    totalInterest: round2(totalPayment - principal),
    months,
  }
}
