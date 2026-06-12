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