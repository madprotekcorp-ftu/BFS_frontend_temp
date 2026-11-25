// Types mirror the "BFS Phase 1 — Backend Development Specification".
// Keep these in sync with the backend contract (sections 3–5 of that doc).

export interface EnumValue<C extends string = string> {
  code: C
  label: string
}

export const LEAD_STATUSES = [
  { code: 'new', label: 'New' },
  { code: 'contacted', label: 'Contacted' },
  { code: 'interested', label: 'Interested' },
  { code: 'follow_up', label: 'Follow-up' },
  { code: 'converted', label: 'Converted' },
  { code: 'closed', label: 'Closed / Not Interested' },
] as const
export type LeadStatusCode = (typeof LEAD_STATUSES)[number]['code']

export const LEAD_SOURCES = [
  { code: 'website', label: 'Website' },
  { code: 'phone', label: 'Phone Call' },
  { code: 'whatsapp', label: 'WhatsApp' },
  { code: 'walk_in', label: 'Walk-in' },
  { code: 'referral', label: 'Referral' },
  { code: 'social_media', label: 'Social Media' },
  { code: 'campaign', label: 'Campaign' },
  { code: 'existing_db', label: 'Existing Database / Import' },
  { code: 'other', label: 'Other' },
] as const
export type LeadSourceCode = (typeof LEAD_SOURCES)[number]['code']

export const DOCUMENT_CATEGORIES = [
  { code: 'kyc', label: 'Identity / KYC' },
  { code: 'income', label: 'Income / Financial' },
  { code: 'loan', label: 'Loan-related' },
  { code: 'other', label: 'Other' },
] as const
export type DocumentCategoryCode = (typeof DOCUMENT_CATEGORIES)[number]['code']

export type ServiceGroup = 'loan' | 'insurance'

export interface ServiceCategory {
  id: number
  name: string
  slug: string
  group: ServiceGroup
  short_description: string
  display_order: number
}

export interface Pagination {
  page: number
  page_size: number
  total: number
  total_pages: number
}

export interface Paginated<T> {
  data: T[]
  pagination: Pagination
}

export interface AdminUser {
  id: number
  username: string
  email: string
  full_name: string
}

export interface Ref {
  id: number
  name: string
}

export interface LeadListItem {
  id: number
  lead_code: string
  customer_name: string
  mobile: string
  service: Ref
  location: string
  source: EnumValue<LeadSourceCode>
  status: EnumValue<LeadStatusCode>
  assigned_employee: Ref | null
  created_at: string
  next_followup_date: string | null
}

export interface LeadDetail extends LeadListItem {
  loan_amount: string
  occupation: string
  message: string
  consent: boolean
  consent_at: string | null
  assigned_at: string | null
  last_followup_date: string | null
  created_by: Ref | null
  import_batch_id: string | null
  updated_at: string
  document_count: number
  remark_count: number
  possible_duplicate?: boolean
}

export interface LeadWritePayload {
  customer_name: string
  mobile: string
  location?: string
  service_id: number
  loan_amount?: string
  occupation?: string
  message?: string
  source?: LeadSourceCode
  status?: LeadStatusCode
  assigned_employee_id?: number | null
  next_followup_date?: string | null
  last_followup_date?: string | null
  allow_duplicate?: boolean
}

export interface Remark {
  id: number
  text: string
  created_by: Ref
  created_at: string
}

export interface Assignment {
  id: number
  previous_employee: Ref | null
  new_employee: Ref | null
  assigned_by: Ref
  assigned_at: string
  note: string
}

export interface Employee {
  id: number
  employee_code: string
  name: string
  mobile: string
  email: string
  is_active: boolean
  lead_counts: { total: number; open: number; converted: number }
}

export interface EmployeeWritePayload {
  employee_code: string
  name: string
  mobile?: string
  email?: string
  is_active?: boolean
}

export interface CountItem<C extends string = string> {
  code: C
  label: string
  count: number
}

export interface DashboardData {
  summary: {
    total_leads: number
    new_leads: number
    followups_due: number
    converted_leads: number
  }
  status_distribution: CountItem<LeadStatusCode>[]
  source_distribution: CountItem<LeadSourceCode>[]
  employee_counts: { employee_id: number; name: string; total: number; open: number; converted: number }[]
  unassigned_count: number
  recent_leads: LeadListItem[]
  upcoming_followups: LeadListItem[]
}

export type ImportRowResult = 'valid' | 'invalid' | 'duplicate' | 'imported'

export interface ImportRow {
  row_number: number
  result: ImportRowResult
  data: Record<string, string>
  errors: { field: string; message: string }[]
}

export interface ImportBatch {
  batch_id: string
  status: 'preview' | 'completed' | 'cancelled'
  filename: string
  summary: {
    total_rows: number
    valid_rows: number
    invalid_rows: number
    duplicate_rows: number
    successful_rows?: number
    failed_rows?: number
  }
  missing_columns: string[]
  rows: ImportRow[]
  rows_pagination?: Pagination
}

export interface LeadDocument {
  id: string
  original_filename: string
  category: EnumValue<DocumentCategoryCode>
  file_size: number
  mime_type: string
  uploaded_by: Ref
  uploaded_at: string
}

export interface BinnedDocument extends LeadDocument {
  lead: { id: number; lead_code: string; customer_name: string }
  deleted_at: string
  deleted_by: Ref
}

export interface EnquiryPayload {
  customer_name: string
  mobile: string
  location?: string
  service_id: number
  loan_amount?: string
  occupation?: string
  message?: string
  consent: true
  website: string
}

export interface LeadFilters {
  page?: number
  page_size?: number
  search?: string
  status?: string
  source?: string
  service_id?: string
  employee_id?: string
  date_from?: string
  date_to?: string
  followup_due?: string
  ordering?: string
}
