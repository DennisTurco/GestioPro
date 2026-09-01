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
import Profilo from './pages/Profilo'
import RequireRole from './components/RequireRole'
import { UserRole } from './types'
import Utenti from './pages/Utenti'
import Contratti from './pages/Contracts'
import RinnoviContratto from './pages/RinnoviContratto'
import Audit from './pages/Audit'
import AuditDetails from './pages/AuditDetails'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/utenti" element={<RequireRole role={UserRole.Admin}><Utenti /></RequireRole>} />
              <Route path="/clienti" element={<Clienti />} />
              <Route path="/clienti/:id" element={<SchedaCliente />} />
              <Route path="/rinnovi/:id" element={<RinnoviContratto />} />
              <Route path="/audit-details/:id" element={<RequireRole role={UserRole.Admin}><AuditDetails /></RequireRole>} />
              <Route path="/preventivi" element={<Preventivi />} />
              <Route path="/contratti" element={<Contratti />} />
              <Route path="/prodotti" element={<Prodotti />} />
              <Route path="/categorie" element={<Categorie />} />
              <Route path="/impostazioni" element={<Impostazioni />} />
              <Route path="/task" element={<Task />} />
              <Route path="/profilo" element={<Profilo />} />
              <Route path="/contratti" element={<Contratti />} />
              <Route path="/audit" element={<RequireRole role={UserRole.Admin}><Audit /></RequireRole>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
