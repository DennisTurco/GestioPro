const UserAPI = {
    /**
     * GET /api/v1/users/me
     * Returns the currently logged-in user (requires valid JWT).
     */
    me: () => apiFetch('/users/me'),

    /**
     * POST /api/v1/auth/login
     * Returns { token, user } on success.
     */
    login: (username: string, password: string) => apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    }),

    /**
     * POST /api/v1/auth/register
     */
    register: (data) => apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};
