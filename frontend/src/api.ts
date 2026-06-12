/**
 * api.js - REST client for Spring Boot
 *
 * All backend calls go through here.
 * Base URL: window.location.origin (so the app works on any port).
 */

const API_BASE = window.location.origin + '/api/v1';

/**
 * Fetch wrapper with centralised error handling.
 * @param {string} endpoint  - e.g. '/clienti' or '/preventivi/1'
 * @param {RequestInit} opts - standard fetch options
 * @returns {Promise<any>}
 */
async function apiFetch(endpoint: string, opts = {}) {
    const url = API_BASE + endpoint;

    const token = localStorage.getItem('auth_token');
    const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...authHeader,
            ...opts.headers,
        },
        ...opts,
    });

    if (!response.ok) {

        let data = null;

        try {
            data = await response.json();
        } catch {
            // response non JSON
        }

        let errorMessage = 'Errore server';

        if (data) {
            errorMessage =
                (data.errors?.[0]?.field ? data.errors[0].field + ', ' : '') +
                (data.errors?.[0]?.defaultMessage ||
                data.message ||
                data.error ||
                response.statusText);
        } else {
            try {
                const text = await response.text();
                errorMessage = text?.slice(0, 200) || response.statusText;
            } catch {}
        }

        throw new ApiError(response.status, errorMessage);
    }

    if (response.status === 204) return null;

    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    }

    // fallback
    return await response.text();
}

/** API error carrying an HTTP status code */
class ApiError extends Error {
    constructor(status, message: string) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}

/* ═══════════════ CUSTOMER ════════════════════════ */
const ClientiAPI = {
    /** GET /api/v1/customers */
    getAll: () => apiFetch('/customers'),

    /** GET /api/v1/customers/:id */
    getById: (id: number) => apiFetch(`/customers/${id}`),

    /** POST /api/v1/customers */
    create: (data) => apiFetch('/customers', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    /** PUT /api/v1/customers/:id */
    update: (id: number, data) => apiFetch(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    /** DELETE /api/v1/customers/:id */
    delete: (id: number) => apiFetch(`/customers/${id}`, { method: 'DELETE' }),
};


/* ═══════════════ PRODUCT ════════════════════════ */
const ProductAPI = {
    /** GET /api/v1/products */
    getAll: () => apiFetch('/products'),

    /** GET /api/v1/products/:id */
    getById: (id: number) => apiFetch(`/products/${id}`),

    /** POST /api/v1/products */
    create: (data) => apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    /** PUT /api/v1/products/:id */
    update: (id: number, data) => apiFetch(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    /** DELETE /api/v1/products/:id */
    delete: (id: number) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
};

/* ═══════════════ PRODUCT STATUS ════════════════════════ */

const ProductStatusAPI = {
    getAll: () => apiFetch('/product-statuses'),
};

/* ═══════════════ PRODUCT CATEGORY ════════════════════════ */

const ProductCategoryAPI = {
    getAll:  ()          => apiFetch('/product-categories'),
    create:  (data)      => apiFetch('/product-categories', { method: 'POST', body: JSON.stringify(data) }),
    update:  (id: number, data)  => apiFetch(`/product-categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete:  (id: number)        => apiFetch(`/product-categories/${id}`, { method: 'DELETE' }),
};

/* ═══════════════ QUOTATIONS ════════════════════════ */
const QuotationAPI = {
    getAll:         ()       => apiFetch('/quotations'),
    getById:        (id: number)     => apiFetch(`/quotations/${id}`),
    create:         (data)   => apiFetch('/quotations', { method: 'POST', body: JSON.stringify(data) }),
    statusUpdate:   (id: number, statusId)  => apiFetch(`/quotations/status-update/${id}`, { method: 'PUT', body: JSON.stringify(statusId) }),
    update:         (id: number, d)  => apiFetch(`/quotations/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
    delete:         (id: number)     => apiFetch(`/quotations/${id}`, { method: 'DELETE' }),
};

/* ═══════════════ QUOTATION STATUSES ════════════════════════ */

const QuotationStatusAPI = {
    getAll: () => apiFetch('/quotation-statuses')

};

/* ═══════════════ TASK ═══════════════════════════ */
const TaskAPI = {
    getAll:   ()       => apiFetch('/task'),
    getById:  (id: number)     => apiFetch(`/task/${id}`),
    create:   (data)   => apiFetch('/task', { method: 'POST', body: JSON.stringify(data) }),
    update:   (id: number, d)  => apiFetch(`/task/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
    delete:   (id: number)     => apiFetch(`/task/${id}`, { method: 'DELETE' }),
};

/* ═══════════════ DASHBOARD ══════════════════════ */
const DashboardAPI = {
    /** GET /api/v1/dashboard/stats - returns aggregated KPIs */
    getStats: () => apiFetch('/dashboard/stats'),
};

/* ═══════════════ SETTINGS ══════════════════════ */
const SettingsAPI = {
    getAll: () => apiFetch("/settings"),
    update: (data) => apiFetch(`/settings`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
};

/* ══════════════ TOAST UTILITY ═══════════════════ */
/**
 * Displays a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} duration  ms before the toast disappears
 */
function showToast(message: string, type = 'info', duration = 3500) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = { success: '<i class="fa-solid fa-check"></i>', error: '<i class="fa-solid fa-x"></i>', warning: '<i class="fa-solid fa-triangle-exclamation"></i>', info: '<i class="fa-solid fa-circle-info"></i>' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] ?? ''} ${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        toast.style.transition = '0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Formats a number as EUR currency.
 * @param {number} value
 * @returns {string}  e.g. "€ 1.240,00"
 */
function formatCurrency(value: number) {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
    }).format(value);
}

/**
 * Formats an ISO date string to the Italian locale format.
 * @param {string} isoString
 * @returns {string}  e.g. "06/05/2025"
 */
function formatDate(isoString: string) {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('it-IT');
}

/**
 * Returns the initials of a full name.
 * @param {string} name
 * @returns {string}  e.g. "MR" for "Mario Rossi"
 */
function getInitials(name = '') {
    return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() ?? '').slice(0, 2).join('');
}
