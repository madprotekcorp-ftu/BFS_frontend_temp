import {
  Briefcase,
  Car,
  Factory,
  Gem,
  GraduationCap,
  HeartPulse,
  Home,
  House,
  LandPlot,
  type LucideIcon,
  ShieldCheck,
  ShieldPlus,
  TrendingUp,
  Truck,
  UserRound,
  UserRoundCheck,
} from 'lucide-react'
import type { ServiceGroup } from '@/lib/api/types'

// Marketing content for service pages. Slugs must match the backend ServiceCategory slugs.
// Copy avoids promises about approval, rates or timelines: lenders make those decisions.

export interface ServiceContent {
  slug: string
  name: string
  group: ServiceGroup
  icon: LucideIcon
  short: string
  intro: string
  suitableFor: string[]
  howWeHelp: string[]
  documents: string[]
}

const commonLoanHelp = [
  'Understand your requirement, budget and repayment comfort',
  'Explain suitable options from lenders in our network',
  'Guide you through the documents each lender asks for',
  'Help you complete and submit the application',
  'Keep you updated until the lender makes its decision',
]

const kyc = ['Identity proof (PAN, Aadhaar)', 'Address proof', 'Recent passport-size photographs']

export const loanServices: ServiceContent[] = [
  {
    slug: 'personal-loan',
    name: 'Personal Loan',
    group: 'loan',
    icon: UserRound,
    short: 'Unsecured funds for planned or unexpected personal expenses.',
    intro:
      'A personal loan can help with medical costs, a wedding, travel, home improvements or consolidating existing debt. We help you compare options and prepare a complete application.',
    suitableFor: ['Salaried professionals', 'Self-employed individuals', 'Customers with a regular income record'],
    howWeHelp: commonLoanHelp,
    documents: [...kyc, 'Recent salary slips or income proof', 'Bank statements for recent months'],
  },
  {
    slug: 'business-loan',
    name: 'Business Loan',
    group: 'loan',
    icon: Briefcase,
    short: 'Working capital and growth funding for your business.',
    intro:
      'Whether you need working capital, new equipment or funds to expand, we help you understand business loan options and what lenders look for.',
    suitableFor: ['Proprietors and partnerships', 'Private limited companies', 'Traders, manufacturers and service businesses'],
    howWeHelp: commonLoanHelp,
    documents: [...kyc, 'Business registration proof', 'GST returns, if applicable', 'Income tax returns and financial statements', 'Business bank statements'],
  },
  {
    slug: 'home-loan',
    name: 'Home Loan',
    group: 'loan',
    icon: Home,
    short: 'Finance to buy, build or renovate your home.',
    intro:
      'Buying or building a home is one of the biggest financial decisions you will make. We help you explore home loan options and organise the documentation lenders need.',
    suitableFor: ['First-time home buyers', 'Customers building on their own plot', 'Home renovation and extension'],
    howWeHelp: commonLoanHelp,
    documents: [...kyc, 'Income proof', 'Bank statements', 'Property documents and approved plan'],
  },
  {
    slug: 'plot-loan',
    name: 'Plot / Site Purchase Loan',
    group: 'loan',
    icon: LandPlot,
    short: 'Funding to purchase a residential plot or site.',
    intro:
      'Plan for the future by purchasing a residential plot. We help you understand plot loan options and the property checks lenders typically carry out.',
    suitableFor: ['Customers buying a residential plot', 'Plot purchase with a plan to build later'],
    howWeHelp: commonLoanHelp,
    documents: [...kyc, 'Income proof', 'Bank statements', 'Plot sale agreement and title documents'],
  },
  {
    slug: 'car-loan',
    name: 'Car Loan',
    group: 'loan',
    icon: Car,
    short: 'Finance for a new or pre-owned car.',
    intro: 'Drive home your new or pre-owned car with a loan that suits your budget. We help you compare options and complete the paperwork.',
    suitableFor: ['New car purchase', 'Pre-owned car purchase', 'Salaried and self-employed customers'],
    howWeHelp: commonLoanHelp,
    documents: [...kyc, 'Income proof', 'Bank statements', 'Vehicle quotation or proforma invoice'],
  },
  {
    slug: 'commercial-vehicle-loan',
    name: 'Commercial Vehicle Loan',
    group: 'loan',
    icon: Truck,
    short: 'Finance for trucks, goods carriers and passenger vehicles.',
    intro: 'Expand your fleet or start a transport business. We help you explore commercial vehicle finance options for new and used vehicles.',
    suitableFor: ['Transport operators', 'First-time vehicle owners', 'Businesses adding to their fleet'],
    howWeHelp: commonLoanHelp,
    documents: [...kyc, 'Income or business proof', 'Bank statements', 'Vehicle quotation', 'Existing fleet details, if any'],
  },
  {
    slug: 'education-loan',
    name: 'Education Loan',
    group: 'loan',
    icon: GraduationCap,
    short: 'Support for higher education in India or abroad.',
    intro: 'Invest in your future or your child’s education. We help you understand education loan options, co-applicant requirements and documentation.',
    suitableFor: ['Students admitted to recognised courses', 'Studies in India or abroad', 'Parents and guardians as co-applicants'],
    howWeHelp: commonLoanHelp,
    documents: [...kyc, 'Admission letter and fee structure', 'Academic records', 'Co-applicant income proof'],
  },
  {
    slug: 'gold-loan',
    name: 'Gold Loan',
    group: 'loan',
    icon: Gem,
    short: 'Funds against the value of your gold jewellery.',
    intro: 'A gold loan lets you raise funds against your gold jewellery. We help you understand the options available and the process involved.',
    suitableFor: ['Short-term personal or business needs', 'Customers who prefer a secured loan'],
    howWeHelp: commonLoanHelp,
    documents: [...kyc, 'Gold jewellery for valuation by the lender'],
  },
  {
    slug: 'msme-loan',
    name: 'MSME Loan',
    group: 'loan',
    icon: Factory,
    short: 'Finance for micro, small and medium enterprises.',
    intro: 'MSMEs need flexible finance to grow. We help you explore term loans, working capital and machinery finance options suited to your enterprise.',
    suitableFor: ['Udyam-registered enterprises', 'Manufacturers and service units', 'Growing small businesses'],
    howWeHelp: commonLoanHelp,
    documents: [...kyc, 'Udyam registration', 'GST returns', 'Income tax returns and financial statements', 'Business bank statements'],
  },
  {
    slug: 'top-up-loan',
    name: 'Top-Up Loan',
    group: 'loan',
    icon: TrendingUp,
    short: 'Additional funds on top of your existing loan.',
    intro: 'If you already have a loan with a good repayment record, a top-up loan may give you access to additional funds. We help you check the options.',
    suitableFor: ['Existing home or loan customers', 'Customers with a regular repayment record'],
    howWeHelp: commonLoanHelp,
    documents: [...kyc, 'Existing loan statement', 'Income proof', 'Bank statements'],
  },
]

const insuranceHelp = [
  'Understand what you want to protect and your budget',
  'Explain cover options and key terms in plain language',
  'Help you complete the proposal and documentation',
  'Assist with renewals when they fall due',
]

export const insuranceServices: ServiceContent[] = [
  {
    slug: 'life-insurance',
    name: 'Life Insurance',
    group: 'insurance',
    icon: ShieldCheck,
    short: 'Financial protection for your family’s future.',
    intro: 'Life insurance helps protect your family’s financial future. We help you understand term and other life cover options.',
    suitableFor: ['Earning members of a family', 'Customers with loans or dependants'],
    howWeHelp: insuranceHelp,
    documents: [...kyc, 'Income proof, where required'],
  },
  {
    slug: 'health-insurance',
    name: 'Health Insurance',
    group: 'insurance',
    icon: HeartPulse,
    short: 'Cover for hospitalisation and medical expenses.',
    intro: 'Medical costs can be unexpected. We help you understand individual and family floater health insurance options.',
    suitableFor: ['Individuals and families', 'Senior citizens', 'Customers seeking additional cover'],
    howWeHelp: insuranceHelp,
    documents: [...kyc, 'Medical history details, where required'],
  },
  {
    slug: 'vehicle-insurance',
    name: 'Vehicle Insurance',
    group: 'insurance',
    icon: ShieldPlus,
    short: 'Cover for cars, two-wheelers and commercial vehicles.',
    intro: 'Vehicle insurance is mandatory and protects you against damage and liability. We help with new policies and renewals.',
    suitableFor: ['Private cars and two-wheelers', 'Commercial vehicles', 'Policy renewals'],
    howWeHelp: insuranceHelp,
    documents: ['Vehicle registration certificate', 'Previous policy, for renewals', ...kyc.slice(0, 1)],
  },
  {
    slug: 'home-insurance',
    name: 'Home Insurance',
    group: 'insurance',
    icon: House,
    short: 'Protection for your home and its contents.',
    intro: 'Protect your home and belongings against risks such as fire and natural events. We help you understand the cover available.',
    suitableFor: ['Home owners', 'Tenants insuring contents', 'Homes with a loan'],
    howWeHelp: insuranceHelp,
    documents: [...kyc, 'Property details'],
  },
  {
    slug: 'personal-accident-insurance',
    name: 'Personal Accident Insurance',
    group: 'insurance',
    icon: UserRoundCheck,
    short: 'Financial support after an accidental injury.',
    intro: 'Personal accident insurance provides financial support in case of accidental injury, disability or death. We help you compare cover options.',
    suitableFor: ['Working professionals', 'Frequent travellers', 'Self-employed individuals'],
    howWeHelp: insuranceHelp,
    documents: kyc,
  },
]

export const allServices = [...loanServices, ...insuranceServices]

// Card/hero photos, keyed by slug (see src/assets/services/CREDITS.md).
const photos = import.meta.glob('../assets/services/*.webp', { eager: true, import: 'default' }) as Record<string, string>
export const serviceImage = (slug: string): string | undefined => photos[`../assets/services/${slug}.webp`]
export const findService = (slug: string) => allServices.find((s) => s.slug === slug)
