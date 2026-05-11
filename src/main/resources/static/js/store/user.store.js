const UserStore = (() => {

    let currentUser = null;

    return {

        async load() {
            try {
                currentUser = await UserAPI.me();
                return currentUser;
            } catch (e) {
                console.warn('Utente non autenticato');
                currentUser = null;
                return null;
            }
        },

        get() {
            return currentUser;
        },

        isAuthenticated() {
            return currentUser !== null;
        },

        clear() {
            currentUser = null;
        }
    };

})();