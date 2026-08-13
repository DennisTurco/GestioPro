import { apiFetch } from './api'
import type { User } from '../types'

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
  me: ()                           => apiFetch<User>('/users/me'),
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
}
