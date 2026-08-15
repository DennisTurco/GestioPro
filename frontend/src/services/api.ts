import type { Customer, CustomerRequest, Product, ProductRequest, ProductCategory, ProductCategoryRequest, Quotation, QuotationRequest, QuotationStatus, Setting, Contract, ContractRequest, ContractRenewal, ContractRenewalRequest } from '../types'

const API_BASE = window.location.protocol === 'file:'
    ? 'https://localhost:7160/api/v1'
    : window.location.origin + '/api/v1'

export class ApiError extends Error {
    status: number
    constructor(status: number, message: string) {
        super(message)
        this.status = status
        this.name = 'ApiError'
    }
}

export async function apiFetch<T = unknown>(endpoint: string, opts: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(API_BASE + endpoint, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(opts.headers ?? {}),
        },
        ...opts,
    })

    if (!response.ok) {
        let msg = 'Errore server'
        try {
            const data = await response.json()
            msg = data.errors?.[0]?.defaultMessage || data.message || data.title || response.statusText
        } catch {
            try { msg = (await response.text()).slice(0, 200) || response.statusText } catch { /* noop */ }
        }
        throw new ApiError(response.status, msg)
    }

    if (response.status === 204) return null as T
    const ct = response.headers.get('content-type')
    return ct?.includes('application/json') ? response.json() : response.text() as unknown as T
}

export const ClientiAPI = {
    getAll: () => apiFetch<Customer[]>('/customers'),
    getById: (id: number) => apiFetch<Customer>(`/customers/${id}`),
    create: (data: CustomerRequest) => apiFetch<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: CustomerRequest) => apiFetch<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => apiFetch<null>(`/customers/${id}`, { method: 'DELETE' }),
}

export const ProductAPI = {
    getAll: () => apiFetch<Product[]>('/products'),
    getById: (id: number) => apiFetch<Product>(`/products/${id}`),
    create: (data: ProductRequest) => apiFetch<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: ProductRequest) => apiFetch<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => apiFetch<null>(`/products/${id}`, { method: 'DELETE' }),
}

export const ProductCategoryAPI = {
    getAll: () => apiFetch<ProductCategory[]>('/product-categories'),
    create: (data: ProductCategoryRequest) => apiFetch<ProductCategory>('/product-categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: ProductCategoryRequest) => apiFetch<ProductCategory>(`/product-categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => apiFetch<null>(`/product-categories/${id}`, { method: 'DELETE' }),
}

export const QuotationAPI = {
    getAll: () => apiFetch<Quotation[]>('/quotations'),
    getById: (id: number) => apiFetch<Quotation>(`/quotations/${id}`),
    create: (data: QuotationRequest) => apiFetch<Quotation>('/quotations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: QuotationRequest) => apiFetch<Quotation>(`/quotations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => apiFetch<null>(`/quotations/${id}`, { method: 'DELETE' }),
    statusUpdate: (id: number, status: QuotationStatus) => apiFetch<null>(`/quotations/${id}/status`, { method: 'PATCH', body: JSON.stringify(status) }),
    getNextNumber: () => apiFetch<string>('/quotations/next-number'),
}

export const SettingsAPI = {
    getAll: () => apiFetch<Setting[]>('/settings'),
    update: (code: string, value: string) => apiFetch<null>(`/settings/${code}`, { method: 'PUT', body: JSON.stringify(value) }),
}

export const ContractAPI = {
    getAll: ()                              => apiFetch<Contract[]>('/contracts'),
    getById: (id: number)                   => apiFetch<Contract>(`/contracts/${id}`),
    create: (data: ContractRequest)         => apiFetch<Contract>('/contracts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: ContractRequest) => apiFetch<Contract>(`/contracts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    getNextNumber: (quotationId: number, quotationNumber: string) => apiFetch<string>(`/contracts/next-number?quotationId=${quotationId}&quotationNumber=${encodeURIComponent(quotationNumber)}`),
    renewal: (id: number)                   => apiFetch<Contract>(`/contracts/renewal?contractId=${id}`),
}

export const ContractRenewalAPI = {
    getByContractId: (contractId: number)           => apiFetch<ContractRenewal[]>(`/contract-renewals/${contractId}`),
    create: (data: ContractRenewalRequest)           => apiFetch<ContractRenewal>('/contract-renewals', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number)                             => apiFetch<null>(`/contract-renewals/${id}`, { method: 'DELETE' }),
}

