import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserAPI } from '../services/user.api'

type Form = 'login' | 'register'

export default function Login() {
  const auth = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<Form>('login')
  const [loading, setLoading] = useState(false)

  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regName, setRegName] = useState('')
  const [regSurname, setRegSurname] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [registerError, setRegisterError] = useState('')

  if (auth.loading) return null
  if (auth.user) return <Navigate to="/" replace />

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    if (!loginUsername || !loginPassword) {
      setLoginError('Inserisci username e password.')
      return
    }
    setLoading(true)
    try {
      await auth.login(loginUsername, loginPassword)
      navigate('/')
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Credenziali non valide.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegisterError('')
    if (!regName || !regSurname || !regUsername || !regEmail || !regPassword || !regConfirmPassword) {
      setRegisterError('Compila tutti i campi.')
      return
    }
    if (regPassword !== regConfirmPassword) {
      setRegisterError('Le password non coincidono.')
      return
    }
    setLoading(true)
    try {
      await UserAPI.register({ username: regUsername, email: regEmail, name: regName, surname: regSurname, password: regPassword })
      await auth.login(regUsername, regPassword)
      navigate('/')
    } catch (err: unknown) {
      setRegisterError(err instanceof Error ? err.message : 'Errore durante la registrazione.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">
            <img src="/icon.svg" alt="GestioPro" />
          </div>
          <h1>GestioPro</h1>
          <p>{form === 'login' ? 'Accedi al tuo account' : 'Crea un nuovo account'}</p>
        </div>

        {form === 'login' && (
          <form onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="form-control"
                placeholder="Il tuo username"
                autoComplete="username"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="La tua password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-login" disabled={loading}>
              <i className="fa-solid fa-right-to-bracket" />
              {loading ? ' Accesso in corso...' : ' Accedi'}
            </button>
            {loginError && (
              <div id="login-error" className="login-error">{loginError}</div>
            )}
            <div className="login-footer">
              Non hai un account?{' '}
              <a onClick={() => { setLoginError(''); setForm('register') }}>Registrati</a>
            </div>
          </form>
        )}

        {form === 'register' && (
          <form onSubmit={handleRegister} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Nome</label>
              <input
                id="reg-name"
                type="text"
                className="form-control"
                placeholder="Nome"
                value={regName}
                onChange={e => setRegName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-surname">Cognome</label>
              <input
                id="reg-surname"
                type="text"
                className="form-control"
                placeholder="Cognome"
                value={regSurname}
                onChange={e => setRegSurname(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">Username</label>
              <input
                id="reg-username"
                type="text"
                className="form-control"
                placeholder="Username"
                autoComplete="username"
                value={regUsername}
                onChange={e => setRegUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                className="form-control"
                placeholder="email@esempio.it"
                autoComplete="email"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                className="form-control"
                placeholder="Password"
                autoComplete="new-password"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm-password">Conferma Password</label>
              <input
                id="reg-confirm-password"
                type="password"
                className="form-control"
                placeholder="Ripeti la password"
                autoComplete="new-password"
                value={regConfirmPassword}
                onChange={e => setRegConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-login" disabled={loading}>
              <i className="fa-solid fa-user-plus" />
              {loading ? ' Registrazione in corso...' : ' Crea account'}
            </button>
            {registerError && (
              <div id="register-error" className="login-error">{registerError}</div>
            )}
            <div className="login-footer">
              <a onClick={() => { setRegisterError(''); setForm('login') }}>← Torna al login</a>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
