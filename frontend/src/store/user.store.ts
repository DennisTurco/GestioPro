const UserStore = (() => {

    let currentUser = null;

    return {

        async load() {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                currentUser = null;
                return null;
            }
            try {
                currentUser = await UserAPI.me();
                return currentUser;
            } catch (e) {
                if (e.status === 401) {
                    localStorage.removeItem('auth_token');
                }
                currentUser = null;
                return null;
            }
        },

        async login(username: string, password: string) {
            const result = await UserAPI.login(username, password);
            localStorage.setItem('auth_token', result.token);
            currentUser = result.user;
            return currentUser;
        },

        logout() {
            localStorage.removeItem('auth_token');
            currentUser = null;
            window.location.href = 'login.html';
        },

        get() {
            return currentUser;
        },

        isAuthenticated() {
            return currentUser !== null;
        },

        clear() {
            localStorage.removeItem('auth_token');
            currentUser = null;
        }
    };

})();
