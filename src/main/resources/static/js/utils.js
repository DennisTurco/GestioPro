// MUST MATCH WITH QuotationStatusEnum
const QUOTATION_STATUSES = {
  draft:     { id: 1,   label: 'Bozza',       cls: 'badge-muted' },
  sent:      { id: 2,   label: 'Inviato',     cls: 'badge-warning' },
  accepted:  { id: 3,   label: 'Accettato',   cls: 'badge-success' },
  rejected:  { id: 4,   label: 'Rifiutato',   cls: 'badge-danger' },
  expired:   { id: 5,   label: 'Scaduto',     cls: 'badge-neutral' },
};

function getQuotationStatusById(id) {
    return Object.values(QUOTATION_STATUSES)
        .find(s => s.id === id);
}

async function loadLoggedUser() {
    try {
        const user = await UserAPI.me();

        if (!user) return;

        document.querySelector('.user-avatar')
            .textContent = getInitials(user.username);

        document.querySelector('.user-username')
            .textContent = user.username ?? 'Utente';

        document.querySelector('.user-email')
            .textContent = user.email ?? '';

    } catch (e) {
        console.error('User fetch error:', e.message);
    }
}