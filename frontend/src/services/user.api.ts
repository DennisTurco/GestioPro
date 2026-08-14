import { apiFetch } from './api'
import type { User, UserCreateRequest, UserRequest } from '../types'

interface LoginResponse {
  token: string
  user: User
}

export const UserAPI = {
    getAll: () => apiFetch<User[]>('/users'),
    me: () => apiFetch<User>('/users/me'),
    login: (username: string, password: string) =>
        apiFetch<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        }),
    // Right now the Register has been disabled because a user could be created only throw an Admin user
    // register: (data: RegisterRequest) =>
    //     apiFetch<LoginResponse>('/auth/register', {
    //     method: 'POST',
    //     body: JSON.stringify(data),
    //     }),
    create: (data: UserCreateRequest) =>
        apiFetch<User>('/auth/create', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    disable: (id: string) => apiFetch<null>(`/users/${id}`, { method: 'DELETE' }),
    updateProfile: (id: string, data: UserRequest) => apiFetch<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateProfilePsw: (id: string, oldPsw: string, newPsw: string) => apiFetch<null>(`/users/${id}/change-password`, { method: 'PUT', body: JSON.stringify({ oldPassword: oldPsw, newPassword: newPsw }) }),
    updatePswForced: (id: string, pws: string) => apiFetch<null>(`/users/${id}/change-password-forced`, { method: 'PUT', body: JSON.stringify(pws) }),
}
