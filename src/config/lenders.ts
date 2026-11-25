// Banking and lending network shown on the website, taken from the BFS flyer.
// Logos are the institutions' official marks, sourced from their Wikipedia/Wikimedia Commons pages
// and stored locally in /public/lenders. They are trademarks of their owners: BFS should confirm it is
// permitted to display them, and must not describe these as partners or tie-ups without written confirmation.

export interface Lender {
  name: string
  /** Path to a verified logo in /public/lenders, if supplied. */
  logo?: string
}

export const lenders: Lender[] = [
  { name: 'SBI', logo: '/lenders/sbi.svg' },
  { name: 'ICICI Bank', logo: '/lenders/icici-bank.png' },
  { name: 'HDFC Bank', logo: '/lenders/hdfc-bank.svg' },
  { name: 'Axis Bank', logo: '/lenders/axis-bank.svg' },
  { name: 'Kotak Mahindra Bank', logo: '/lenders/kotak-mahindra-bank.svg' },
  { name: 'Bank of Baroda', logo: '/lenders/bank-of-baroda.svg' },
  { name: 'Federal Bank', logo: '/lenders/federal-bank.svg' },
  { name: 'Karnataka Bank', logo: '/lenders/karnataka-bank.png' },
  { name: 'IndusInd Bank', logo: '/lenders/indusind-bank.svg' },
  { name: 'Punjab National Bank', logo: '/lenders/punjab-national-bank.svg' },
  { name: 'Canara Bank', logo: '/lenders/canara-bank.png' },
  { name: 'Union Bank of India', logo: '/lenders/union-bank-of-india.svg' },
  { name: 'YES Bank', logo: '/lenders/yes-bank.svg' },
  { name: 'RBL Bank', logo: '/lenders/rbl-bank.png' },
  { name: 'Equitas Small Finance Bank', logo: '/lenders/equitas-small-finance-bank.png' },
  { name: 'Ujjivan Small Finance Bank', logo: '/lenders/ujjivan-small-finance-bank.png' },
  { name: 'Tata Capital', logo: '/lenders/tata-capital.png' },
  { name: 'IDBI Bank', logo: '/lenders/idbi-bank.svg' },
  { name: 'Indian Bank', logo: '/lenders/indian-bank.png' },
  { name: 'South Indian Bank', logo: '/lenders/south-indian-bank.svg' },
  { name: 'AU Small Finance Bank', logo: '/lenders/au-small-finance-bank.svg' },
  { name: 'Bandhan Bank', logo: '/lenders/bandhan-bank.svg' },
  { name: 'Indian Overseas Bank', logo: '/lenders/indian-overseas-bank.svg' },
]
