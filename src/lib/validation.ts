import { z } from 'zod'

/** Strips spaces, dashes and a leading +91 / 91 / 0, mirroring the backend rule. */
export function normaliseMobile(input: string): string {
  let s = input.replace(/[\s\-()]/g, '')
  if (s.startsWith('+91')) s = s.slice(3)
  else if (s.length === 12 && s.startsWith('91')) s = s.slice(2)
  else if (s.length === 11 && s.startsWith('0')) s = s.slice(1)
  return s
}

export const isIndianMobile = (input: string) => /^[6-9]\d{9}$/.test(normaliseMobile(input))

export const mobileSchema = z
  .string()
  .trim()
  .min(1, 'Mobile number is required.')
  .refine(isIndianMobile, 'Enter a valid 10-digit Indian mobile number.')
  .transform(normaliseMobile)

export const optionalText = (max: number, label = 'This field') =>
  z.string().trim().max(max, `${label} must be ${max} characters or fewer.`).optional().or(z.literal(''))
