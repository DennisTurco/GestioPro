import { apiFetch } from './api'
import type { User, UserRequest } from '../types'

interface LoginResponse {
  token: string
  user: User
}

interface RegisterRequest {
  username: string
  email: string
  password: string
  name: string
  surname: string
}

export const UserAPI = {
    me: () => apiFetch<User>('/users/me'),
    login: (username: string, password: string) =>
        apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        }),
    register: (data: RegisterRequest) =>
        apiFetch<LoginResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
        }),
    updateProfile: (id: string, data: UserRequest) => apiFetch<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateProfilePsw: (id: string, oldPsw: string, newPsw: string) => apiFetch<null>(`/users/${id}/change-password`, { method: 'PUT', body: JSON.stringify({ oldPassword: oldPsw, newPassword: newPsw }) }),
}
