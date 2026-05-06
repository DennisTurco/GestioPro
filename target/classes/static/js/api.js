/**
 * api.js — Client REST per Spring Boot
 *
 * Tutte le chiamate al backend passano da qui.
 * Base URL: window.location.origin (quindi l'app funziona su qualsiasi porta).
 */

const API_BASE = window.location.origin + '/api';

/**
 * Wrapper fetch con gestione errori centralizzata.
 * @param {string} endpoint  - es. '/clienti' o '/fatture/1'
 * @param {RequestInit} opts - opzioni fetch standard
 * @returns {Promise<any>}
 */
async function apiFetch(endpoint, opts = {}) {
    const url = API_BASE + endpoint;

    const defaults = {
        headers: { 'Content-Type': 'application/json', ...opts.headers },
    };

    const response = await fetch(url, { ...defaults, ...opts });

    if (!response.ok) {
        const msg = await response.text().catch(() => response.statusText);
        throw new ApiError(response.status, msg);
    }

    // 204 No Content → nessun body
    if (response.status === 204) return null;

    return response.json();
}

/** Errore API con status code */
class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}

/* ═══════════════ CLIENTI ════════════════════════ */
const ClientiAPI = {
    /** GET /api/clienti */
    getAll: () => apiFetch('/clienti'),

    /** GET /api/clienti/:id */
    getById: (id) => apiFetch(`/clienti/${id}`),

    /** POST /api/clienti */
    create: (data) => apiFetch('/clienti', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    /** PUT /api/clienti/:id */
    update: (id, data) => apiFetch(`/clienti/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    /** DELETE /api/clienti/:id */
    delete: (id) => apiFetch(`/clienti/${id}`, { method: 'DELETE' }),
};

/* ═══════════════ FATTURE ════════════════════════ */
const FattureAPI = {
    getAll:   ()       => apiFetch('/fatture'),
    getById:  (id)     => apiFetch(`/fatture/${id}`),
    create:   (data)   => apiFetch('/fatture', { method: 'POST', body: JSON.stringify(data) }),
    update:   (id, d)  => apiFetch(`/fatture/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
    delete:   (id)     => apiFetch(`/fatture/${id}`, { method: 'DELETE' }),
};

/* ═══════════════ TASK ═══════════════════════════ */
const TaskAPI = {
    getAll:   ()       => apiFetch('/task'),
    getById:  (id)     => apiFetch(`/task/${id}`),
    create:   (data)   => apiFetch('/task', { method: 'POST', body: JSON.stringify(data) }),
    update:   (id, d)  => apiFetch(`/task/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
    delete:   (id)     => apiFetch(`/task/${id}`, { method: 'DELETE' }),
};

/* ═══════════════ DASHBOARD ══════════════════════ */
const DashboardAPI = {
    /** GET /api/dashboard/stats — ritorna KPI aggregati */
    getStats: () => apiFetch('/dashboard/stats'),
};

/* ══════════════ TOAST UTILITY ═══════════════════ */
/**
 * Mostra una notifica toast.
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} duration  ms prima di scomparire
 */
function showToast(message, type = 'info', duration = 3500) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
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
 * Formatta un numero come valuta EUR.
 * @param {number} value
 * @returns {string}  es. "€ 1.240,00"
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
    }).format(value);
}

/**
 * Formatta una data ISO in formato locale IT.
 * @param {string} isoString
 * @returns {string}  es. "06/05/2025"
 */
function formatDate(isoString) {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('it-IT');
}

/**
 * Restituisce le iniziali di un nome.
 * @param {string} name
 * @returns {string}  es. "MR" per "Mario Rossi"
 */
function getInitials(name = '') {
    return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() ?? '').slice(0, 2).join('');
}
