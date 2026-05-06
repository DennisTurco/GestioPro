/**
 * app.js — Shared UI logic across all pages
 *
 * - Page navigation
 * - Generic modal management
 * - DOM utilities
 */

/* ══════════ NAVIGATION ═════════════════════════════ */

/**
 * Route map → HTML file.
 * Add new pages here.
 */
const ROUTES = {
    dashboard:   'index.html',
    clienti:     'clienti.html',
    fatture:     'fatture.html',
    task:        'task.html',
    impostazioni:'impostazioni.html',
};

/**
 * Navigates to a page.
 * @param {string} page  key in ROUTES
 */
function navigateTo(page) {
    const file = ROUTES[page];
    if (file) window.location.href = file;
}

/**
 * Marks the sidebar item corresponding to the current page as "active".
 * Call this on every page load.
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
 * Opens a modal given its overlay element id.
 * @param {string} overlayId
 */
function openModal(overlayId) {
    const el = document.getElementById(overlayId);
    if (el) el.classList.add('open');
}

/**
 * Closes a modal given its overlay element id.
 * @param {string} overlayId
 */
function closeModal(overlayId) {
    const el = document.getElementById(overlayId);
    if (el) el.classList.remove('open');
}

/**
 * Closes the modal when clicking on the overlay (outside the panel).
 * Close buttons should have the data-modal-close attribute.
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
 * querySelector shorthand.
 * @param {string} selector
 * @param {Element} [context=document]
 */
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

/**
 * Clears an element and sets its inner HTML.
 * @param {Element} el
 * @param {string}  html
 */
function setHTML(el, html) {
    if (el) el.innerHTML = html;
}

/**
 * Renders a loading spinner inside an element.
 * @param {Element} el
 */
function showLoading(el) {
    setHTML(el, `<div class="text-center" style="padding:32px"><div class="spinner"></div></div>`);
}

/**
 * Renders an empty state inside an element.
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
 * Client-side filter/search over a list of objects.
 * @param {Array}    items      - array to filter
 * @param {string}   query      - search text
 * @param {string[]} fields     - object fields to search in
 * @returns {Array}
 */
function filterItems(items, query, fields) {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(item =>
        fields.some(f => String(item[f] ?? '').toLowerCase().includes(q))
    );
}

/* ══════════ COMMON INIT ════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initSidebarActiveState();
    initModalCloseHandlers();
});
