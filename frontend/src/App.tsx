import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clienti from './pages/Clienti'
import SchedaCliente from './pages/SchedaCliente'
import Preventivi from './pages/Preventivi'
import Prodotti from './pages/Prodotti'
import Categorie from './pages/Categorie'
import Impostazioni from './pages/Impostazioni'
import Task from './pages/Task'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clienti" element={<Clienti />} />
              <Route path="/clienti/:id" element={<SchedaCliente />} />
              <Route path="/preventivi" element={<Preventivi />} />
              <Route path="/prodotti" element={<Prodotti />} />
              <Route path="/categorie" element={<Categorie />} />
              <Route path="/impostazioni" element={<Impostazioni />} />
              <Route path="/task" element={<Task />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
