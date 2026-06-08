const UserAPI = {

    /**
     * GET /api/v1/users/me
     * ritorna l'utente loggato
     */
    me: () => apiFetch('/user/me'),

    /** GET /api/v1/user/register - register a new user */
    register: () => apiFetch('/user/register'),

};
