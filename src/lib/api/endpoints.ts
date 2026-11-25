import { http, type Query } from './client'
import type {
  AdminUser,
  BinnedDocument,
  Assignment,
  DashboardData,
  Employee,
  EmployeeWritePayload,
  EnquiryPayload,
  ImportBatch,
  LeadDetail,
  LeadDocument,
  LeadFilters,
  LeadListItem,
  LeadWritePayload,
  Remark,
  ServiceCategory,
  ServiceGroup,
} from './types'

const q = (f: object) => f as Query

export const publicApi = {
  services: (group?: ServiceGroup) => http.get<ServiceCategory[]>('/api/services/', { group }),
  submitEnquiry: (payload: EnquiryPayload) =>
    http.postWithMessage<{ reference: string }>('/api/public/enquiries/', payload),
}

export const authApi = {
  login: (username: string, password: string) => http.post<AdminUser>('/api/auth/login/', { username, password }),
  logout: () => http.post<null>('/api/auth/logout/'),
  me: () => http.get<AdminUser>('/api/auth/me/'),
}

export const adminApi = {
  dashboard: (filters: Query) => http.get<DashboardData>('/api/admin/dashboard/', filters),

  leads: (filters: LeadFilters) => http.page<LeadListItem>('/api/admin/leads/', q(filters)),
  lead: (id: number) => http.get<LeadDetail>(`/api/admin/leads/${id}/`),
  createLead: (payload: LeadWritePayload) => http.post<LeadDetail>('/api/admin/leads/', payload),
  updateLead: (id: number, payload: Partial<LeadWritePayload>) =>
    http.patch<LeadDetail>(`/api/admin/leads/${id}/`, payload),
  deleteLead: (id: number) => http.del(`/api/admin/leads/${id}/`),
  exportLeads: (filters: LeadFilters) =>
    http.download('/api/admin/leads/export/', q({ ...filters, page: undefined, page_size: undefined }), 'bfs-leads.csv'),

  remarks: (id: number) => http.get<Remark[]>(`/api/admin/leads/${id}/remarks/`),
  addRemark: (id: number, text: string) => http.post<Remark>(`/api/admin/leads/${id}/remarks/`, { text }),

  assign: (id: number, employee_id: number | null, note?: string) =>
    http.post<LeadDetail>(`/api/admin/leads/${id}/assign/`, { employee_id, note }),
  assignments: (id: number) => http.get<Assignment[]>(`/api/admin/leads/${id}/assignments/`),

  employees: (query: Query = {}) => http.get<Employee[]>('/api/admin/employees/', query),
  createEmployee: (payload: EmployeeWritePayload) => http.post<Employee>('/api/admin/employees/', payload),
  updateEmployee: (id: number, payload: Partial<EmployeeWritePayload>) =>
    http.patch<Employee>(`/api/admin/employees/${id}/`, payload),

  importTemplate: (format: 'csv' | 'xlsx') =>
    http.download('/api/admin/leads/import/template/', { format }, `bfs-import-template.${format}`),
  importUpload: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return http.upload<ImportBatch>('/api/admin/leads/import/', fd)
  },
  importBatch: (batchId: string, query: Query = {}) =>
    http.get<ImportBatch>(`/api/admin/leads/import/${batchId}/`, query),
  importConfirm: (batchId: string) => http.post<ImportBatch>(`/api/admin/leads/import/${batchId}/confirm/`),
  importCancel: (batchId: string) => http.post<ImportBatch>(`/api/admin/leads/import/${batchId}/cancel/`),
  importReport: (batchId: string) =>
    http.download(`/api/admin/leads/import/${batchId}/report/`, undefined, `import-errors-${batchId}.csv`),

  documents: (leadId: number) => http.get<LeadDocument[]>(`/api/admin/leads/${leadId}/documents/`),
  uploadDocument: (leadId: number, file: File, category: string) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('category', category)
    return http.upload<LeadDocument>(`/api/admin/leads/${leadId}/documents/`, fd)
  },
  downloadDocument: (doc: LeadDocument) =>
    http.download(`/api/admin/documents/${doc.id}/download/`, undefined, doc.original_filename),
  viewDocument: (docId: string) => http.objectUrl(`/api/admin/documents/${docId}/download/`, { inline: 1 }),
  /** Moves a document to the bin (restorable). */
  deleteDocument: (docId: string) => http.del(`/api/admin/documents/${docId}/`),
  documentBin: (page = 1) => http.page<BinnedDocument>('/api/admin/documents/bin/', { page }),
  restoreDocument: (docId: string) => http.post<LeadDocument>(`/api/admin/documents/${docId}/restore/`),
  purgeDocument: (docId: string) => http.del(`/api/admin/documents/${docId}/purge/`),
}
