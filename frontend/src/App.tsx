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
import Admin from './pages/Admin'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* TEMP preview route, bypasses auth — remove before committing */}
            <Route path="/admin-preview" element={<Admin />} />
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
              <Route path="/profilo" element={<Profilo />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
