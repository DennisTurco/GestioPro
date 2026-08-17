// Mirrors C# enums
export enum CustomerType {
  Company = 1,
  PublicAdmin = 2,
  Freelancer = 3,
  Private = 4,
}

export enum QuotationStatus {
  Draft = 1,
  Sent = 2,
  Accepted = 3,
  Rejected = 4,
  Expired = 5,
}

export enum ProductStatus {
  New = 1,
  Used = 2,
}

export enum UserRole {
    Admin = 1,
    Operator = 2
}

// Mirrors C# DTOs (ASP.NET Core serializes to camelCase)
export interface User {
  id: string
  username: string
  email: string
  name: string
  surname: string
  createdDate: string
  lastUpdateDate: string
  isDisabled: boolean
  userRole: UserRole
}

export interface UserRequest {
    username: string
    email: string
    name: string
    surname: string
}

export interface UserCreateRequest {
  username: string
  email: string
  name: string
  surname: string
  password: string
  isDisabled: boolean
  userRole: UserRole
}

export interface Customer {
  id: number
  customerType: CustomerType
  name: string
  surname: string
  email: string
  phone: string
  country?: string
  region?: string
  city?: string
  province?: string
  address?: string
  vatNumber?: string
  companyName?: string
  taxCode?: string
  landline?: string
  lat?: number
  lon?: number
  notes?: string
  insertDate: string
  lastUpdateDate: string
  quotationCount: number
  contractCount: number
}

export interface CustomerRequest {
  customerType: CustomerType
  name: string
  surname: string
  email: string
  phone: string
  country?: string
  region?: string
  city?: string
  province?: string
  address?: string
  vatNumber?: string
  companyName?: string
  taxCode?: string
  landline?: string
  lat?: number
  lon?: number
  notes?: string
}

export interface Product {
  id: number
  categoryId: number
  categoryName: string
  productStatus: ProductStatus
  code: string
  ean?: string
  name: string
  description?: string
  quantity?: number
  vatPercentage: number
  price: number
}

export interface ProductRequest {
  categoryId: number
  productStatus: ProductStatus
  code: string
  ean?: string
  name: string
  description?: string
  quantity?: number
  vatPercentage: number
  price: number
}

export interface ProductCategory {
  id: number
  name: string
  description?: string
  creationDate: string
  lastUpdateDate: string
}

export interface ProductCategoryRequest {
  name: string
  description?: string
}

export interface Quotation {
  id: number
  customerId: number
  customerName: string
  quotationStatus: QuotationStatus
  number: string
  title: string
  amount: number
  vatPercentage: number
  discountPercentage: number
  description?: string
  notes?: string
  creationDate: string
  lastUpdateDate: string
  issueDate?: string
  validityDate?: string
  isDisabled: boolean
}

export interface QuotationRequest {
  customerId: number
  quotationStatus: QuotationStatus
  number: string
  title: string
  amount: number
  vatPercentage: number
  discountPercentage: number
  description?: string
  notes?: string
  issueDate?: string
  validityDate?: string
}

export interface Setting {
  code: string
  value?: string
  description?: string
  lastUpdateDate?: string
}

// UI helpers
export const CUSTOMER_TYPE_LABEL: Record<CustomerType, string> = {
  [CustomerType.Company]:     'Azienda',
  [CustomerType.PublicAdmin]: 'Pubblica Amministrazione',
  [CustomerType.Freelancer]:  'Libero Professionista',
  [CustomerType.Private]:     'Privato',
}

export const QUOTATION_STATUS_INFO: Record<QuotationStatus, { text: string; cls: string }> = {
  [QuotationStatus.Draft]:    { text: 'Bozza',     cls: 'badge-muted'   },
  [QuotationStatus.Sent]:     { text: 'Inviato',   cls: 'badge-info'    },
  [QuotationStatus.Accepted]: { text: 'Accettato', cls: 'badge-success' },
  [QuotationStatus.Rejected]: { text: 'Rifiutato', cls: 'badge-danger'  },
  [QuotationStatus.Expired]:  { text: 'Scaduto',   cls: 'badge-warning' },
}

export const PRODUCT_STATUS_INFO: Record<ProductStatus, { text: string; cls: string }> = {
  [ProductStatus.New]:  { text: 'Nuovo', cls: 'badge-success' },
  [ProductStatus.Used]: { text: 'Usato', cls: 'badge-warning' },
}

export enum ContractType {
  Monthly   = 0,
  Quarterly = 1,
  Semestral = 2,
  Annual    = 3,
}

export interface Contract {
  id: number
  quotationId: number
  contractType: ContractType
  number: string
  title: string
  amount: number
  totalAmount: number
  vatPercentage: number
  description?: string
  notes?: string
  startDate: string
  endDate: string
  filePath?: string
  creationDate: string
  lastUpdateDate: string
  status: string
}

export interface ContractRequest {
  quotationId: number
  contractType: ContractType
  number: string
  title: string
  amount: number
  vatPercentage: number
  description?: string
  notes?: string
  filePath?: string
  startDate: string
}

export const CONTRACT_TYPE_LABEL: Record<ContractType, string> = {
  [ContractType.Monthly]:   'Mensile',
  [ContractType.Quarterly]: 'Trimestrale',
  [ContractType.Semestral]: 'Semestrale',
  [ContractType.Annual]:    'Annuale',
}

export const CONTRACT_STATUS_CLS: Record<string, string> = {
  'Attivo':       'badge-success',
  'In scadenza':  'badge-warning',
  'Scaduto':      'badge-danger',
}

export interface ContractRenewal {
  id: number
  contractId: number
  amount: number
  startDate: string
  endDate: string
  renewalDate: string
  notes?: string
}

export interface ContractRenewalRequest {
  contractId: number
  amount: number
  startDate: string
  notes?: string
}
