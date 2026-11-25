import type { Pagination } from './types'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

/** Dev-only mock backend. `import.meta.env.DEV` is false in production builds, so the mock is never bundled. */
export const USE_MOCK_API = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === 'true'

export interface ApiErrorShape {
  code: string
  message: string
  fields?: Record<string, string[]>
  [extra: string]: unknown
}

export class ApiError extends Error {
  status: number
  code: string
  fields: Record<string, string[]>
  details: ApiErrorShape

  constructor(status: number, err: ApiErrorShape) {
    super(err.message || 'Something went wrong. Please try again.')
    this.status = status
    this.code = err.code || 'server_error'
    this.fields = err.fields ?? {}
    this.details = err
  }
}

export interface RawResponse {
  status: number
  headers: Headers
  json?: unknown
  blob?: Blob
}

export type Query = Record<string, string | number | boolean | null | undefined>

interface RequestOptions {
  query?: Query
  body?: unknown
  formData?: FormData
  expectBlob?: boolean
}

let csrfToken: string | null = null

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/** Fetches the CSRF token once. The backend sets the `csrftoken` cookie and may also return it in the body. */
export async function ensureCsrf(force = false): Promise<string | null> {
  if (USE_MOCK_API) return 'mock'
  if (csrfToken && !force) return csrfToken
  const res = await fetch(`${BASE_URL}/api/auth/csrf/`, { credentials: 'include' })
  try {
    const json = (await res.json()) as { data?: { csrf_token?: string } }
    csrfToken = json?.data?.csrf_token ?? readCookie('csrftoken')
  } catch {
    csrfToken = readCookie('csrftoken')
  }
  return csrfToken
}

export function buildQuery(query?: Query): string {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue
    params.set(k, String(v))
  }
  const s = params.toString()
  return s ? `?${s}` : ''
}

async function send(method: string, path: string, opts: RequestOptions): Promise<RawResponse> {
  const url = `${path}${buildQuery(opts.query)}`

  if (USE_MOCK_API) {
    const { handleMockRequest } = await import('../mock/server')
    return handleMockRequest(method, url, opts.body, opts.formData)
  }

  const headers: Record<string, string> = { Accept: 'application/json' }
  let body: BodyInit | undefined
  if (opts.formData) {
    body = opts.formData
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(opts.body)
  }
  if (method !== 'GET') {
    const token = await ensureCsrf()
    if (token) headers['X-CSRFToken'] = token
  }

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${url}`, { method, headers, body, credentials: 'include' })
  } catch {
    throw new ApiError(0, {
      code: 'network_error',
      message: 'Unable to reach the server. Please check your connection and try again.',
    })
  }

  const contentType = res.headers.get('Content-Type') ?? ''
  if (res.ok && opts.expectBlob && !contentType.includes('application/json')) {
    return { status: res.status, headers: res.headers, blob: await res.blob() }
  }
  let json: unknown = undefined
  if (res.status !== 204) {
    try {
      json = await res.json()
    } catch {
      json = undefined
    }
  }
  return { status: res.status, headers: res.headers, json }
}

async function request(method: string, path: string, opts: RequestOptions = {}): Promise<RawResponse> {
  let res = await send(method, path, opts)
  // A stale CSRF token gets one silent retry.
  if (res.status === 403 && (res.json as { error?: ApiErrorShape })?.error?.code === 'csrf_failed') {
    await ensureCsrf(true)
    res = await send(method, path, opts)
  }
  if (res.status >= 400 || res.status === 0) {
    if (res.status === 401 && !path.startsWith('/api/auth/')) onUnauthorized?.()
    const err = (res.json as { error?: ApiErrorShape })?.error
    throw new ApiError(
      res.status,
      err ?? { code: res.status === 401 ? 'not_authenticated' : 'server_error', message: defaultMessage(res.status) },
    )
  }
  return res
}

function defaultMessage(status: number): string {
  if (status === 401) return 'Your session has expired. Please sign in again.'
  if (status === 403) return 'You do not have permission to do that.'
  if (status === 404) return 'The requested record was not found.'
  if (status === 413) return 'The file is too large.'
  if (status === 429) return 'Too many attempts. Please wait a few minutes and try again.'
  return 'Something went wrong. Please try again.'
}

let onUnauthorized: (() => void) | undefined
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn
}

type Envelope<T> = { success: true; data: T; message?: string; pagination?: Pagination }

export const http = {
  async get<T>(path: string, query?: Query): Promise<T> {
    const res = await request('GET', path, { query })
    return (res.json as Envelope<T>).data
  },
  async page<T>(path: string, query?: Query): Promise<{ data: T[]; pagination: Pagination }> {
    const res = await request('GET', path, { query })
    const env = res.json as Envelope<T[]>
    return {
      data: env.data,
      pagination: env.pagination ?? { page: 1, page_size: env.data.length, total: env.data.length, total_pages: 1 },
    }
  },
  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await request('POST', path, { body })
    return (res.json as Envelope<T>)?.data
  },
  async postWithMessage<T>(path: string, body?: unknown): Promise<{ data: T; message?: string }> {
    const res = await request('POST', path, { body })
    const env = res.json as Envelope<T>
    return { data: env.data, message: env.message }
  },
  async patch<T>(path: string, body: unknown): Promise<T> {
    const res = await request('PATCH', path, { body })
    return (res.json as Envelope<T>).data
  },
  async del(path: string): Promise<void> {
    await request('DELETE', path)
  },
  async upload<T>(path: string, formData: FormData): Promise<T> {
    const res = await request('POST', path, { formData })
    return (res.json as Envelope<T>).data
  },
  /** Downloads a file response and saves it in the browser. */
  async download(path: string, query?: Query, fallbackName = 'download'): Promise<void> {
    const res = await request('GET', path, { query, expectBlob: true })
    if (!res.blob) throw new ApiError(500, { code: 'server_error', message: 'The file could not be downloaded.' })
    const disposition = res.headers.get('Content-Disposition') ?? ''
    const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)
    const name = match ? decodeURIComponent(match[1]) : fallbackName
    saveBlob(res.blob, name)
  },
  /** Fetches a file and returns an object URL for inline viewing. Caller must revoke it. */
  async objectUrl(path: string, query?: Query): Promise<string> {
    const res = await request('GET', path, { query, expectBlob: true })
    if (!res.blob) throw new ApiError(500, { code: 'server_error', message: 'The file could not be opened.' })
    return URL.createObjectURL(res.blob)
  },
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
