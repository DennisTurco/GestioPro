/**
 * app.js — Logica UI condivisa tra le pagine
 *
 * - Navigazione tra pagine
 * - Gestione modale generica
 * - Utilities DOM
 */

/* ══════════ NAVIGAZIONE ════════════════════════════ */

/**
 * Mappa route → file HTML.
 * Aggiungere qui le nuove pagine.
 */
const ROUTES = {
    dashboard:   'index.html',
    clienti:     'clienti.html',
    fatture:     'fatture.html',
    task:        'task.html',
    impostazioni:'impostazioni.html',
};

/**
 * Naviga verso una pagina.
 * @param {string} page  chiave in ROUTES
 */
function navigateTo(page) {
    const file = ROUTES[page];
    if (file) window.location.href = file;
}

/**
 * Marca come "active" la voce di sidebar corrispondente alla pagina corrente.
 * Chiamare all'avvio di ogni pagina.
 */
function initSidebarActiveState() {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
        const page = el.dataset.page;
        const file = ROUTES[page];
        if (file === currentFile) {
            el.classList.add('active');
        }
        el.addEventListener('click', () => navigateTo(page));
    });
}

/* ══════════ MODAL ══════════════════════════════════ */

/**
 * Apre un modal dato il suo overlay id.
 * @param {string} overlayId
 */
function openModal(overlayId) {
    const el = document.getElementById(overlayId);
    if (el) el.classList.add('open');
}

/**
 * Chiude un modal dato il suo overlay id.
 * @param {string} overlayId
 */
function closeModal(overlayId) {
    const el = document.getElementById(overlayId);
    if (el) el.classList.remove('open');
}

/**
 * Chiude il modal cliccando sull'overlay (fuori dal panel).
 * Aggiungere attributo data-modal-close ai bottoni di chiusura.
 */
function initModalCloseHandlers() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('open');
        });
    });
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const overlayId = btn.dataset.modalClose;
            closeModal(overlayId);
        });
    });
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
        btn.addEventListener('click', () => {
            const overlayId = btn.dataset.modalOpen;
            openModal(overlayId);
        });
    });
}

/* ══════════ DOM UTILITIES ══════════════════════════ */

/**
 * Scorciatoia querySelector.
 * @param {string} selector
 * @param {Element} [context=document]
 */
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

/**
 * Svuota un elemento e ci inserisce HTML.
 * @param {Element} el
 * @param {string}  html
 */
function setHTML(el, html) {
    if (el) el.innerHTML = html;
}

/**
 * Mostra uno spinner di caricamento in un elemento.
 * @param {Element} el
 */
function showLoading(el) {
    setHTML(el, `<div class="text-center" style="padding:32px"><div class="spinner"></div></div>`);
}

/**
 * Mostra un empty state in un elemento.
 * @param {Element} el
 * @param {string} message
 * @param {string} [actionLabel]
 * @param {string} [actionCallback]
 */
function showEmptyState(el, message = 'Nessun elemento', actionLabel = '', actionCallback = '') {
    const action = actionLabel
        ? `<button class="btn btn-primary" onclick="${actionCallback}">${actionLabel}</button>`
        : '';
    setHTML(el, `
        <div class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>${message}</h3>
            <p>Non ci sono ancora elementi da mostrare.</p>
            ${action}
        </div>`);
}

/**
 * Funzione di filtro/ricerca client-side su una lista di oggetti.
 * @param {Array}    items      - array da filtrare
 * @param {string}   query      - testo cercato
 * @param {string[]} fields     - campi su cui cercare
 * @returns {Array}
 */
function filterItems(items, query, fields) {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(item =>
        fields.some(f => String(item[f] ?? '').toLowerCase().includes(q))
    );
}

/* ══════════ INIT COMUNE ════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initSidebarActiveState();
    initModalCloseHandlers();
});
