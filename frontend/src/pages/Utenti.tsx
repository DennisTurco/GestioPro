import { useState, useEffect } from "react";
import { UserCreateRequest, User, UserRole } from "../types";
import { formatDate } from "../utils/date";
import { useToast } from "../context/ToastContext";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import ConfirmModal from "../components/ui/ConfirmModal";
import { UserAPI } from "../services/user.api";

const EMPTY_FORM: UserCreateRequest = {
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
    isDisabled: false,
    userRole: UserRole.Operator,
}

export default function Utenti() {
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, _] = useState(false);

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')

    const [modalOpen, setModalOpen] = useState(false)
    const [modalPasswordOpen, setPasswordModalOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<User | null>(null)
    const [form, setForm] = useState<UserCreateRequest>(EMPTY_FORM)
    const [saving, setSaving] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
    const [deleting, setDeleting] = useState(false)

    const [pwForm, setPwForm] = useState({
        pwd: '',
        confirm: '',
    })

  useEffect(() => {
    document.title = "Utenti - GestioPro";
    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="text-center" style={{ padding: "64px 0" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center" style={{ padding: "64px 0" }}>
        <p className="text-muted">Non raggiungibile</p>
      </div>
    );
  }

  async function loadUsers() {
    setLoading(true);
    try {
      const users = await UserAPI.getAll();
      setUsers(users);
    } catch (err: unknown) {
      showToast(
        err instanceof Error
          ? err.message
          : "Errore nel caricamento degli utenti",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setPwForm({ pwd: '', confirm: '' });
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditTarget(user);
    setForm({ userRole: user.userRole, name: user.name, surname: user.surname, email: user.email, username: user.username, password: '', isDisabled: user.isDisabled });
    setModalOpen(true);
  }

  function openPasswordReset(user: User) {
    setEditTarget(user);
    setPwForm({ pwd: '', confirm: '' });
    setPasswordModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setPwForm({ pwd: '', confirm: '' });
  }

  function closeModalPassword() {
    setPasswordModalOpen(false);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      showToast("Il nome è obbligatorio", "warning");
      return;
    }
    if (!form.surname.trim()) {
      showToast("Il cognome è obbligatorio", "warning");
      return;
    }
    if (!form.email.trim()) {
      showToast("L'email è obbligatoria", "warning");
      return;
    }
    if (!form.username.trim()) {
      showToast("Lo username è obbligatorio", "warning");
      return;
    }
    if (!editTarget) {
      const valid = await passwordValidation();
      if (!valid) return;
    }
    const payload = editTarget
      ? form
      : { ...form, password: pwForm.pwd };
    setSaving(true);
    try {
      if (editTarget) {
        const updated = await UserAPI.updateForced(editTarget.id, payload);
        setUsers((prev) =>
          prev.map((c) => (c.id === editTarget.id ? updated : c)),
        );
        showToast("Utente aggiornato", "success");
      } else {
        await UserAPI.create(payload);
        await loadUsers();
        showToast("Utente creato", "success");
      }
      closeModal();
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Errore durante il salvataggio",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordReset() {
    const valid = await passwordValidation();
    if (!valid) return;
    if (!editTarget) return;
    setSaving(true);
    try {
      const updated = await UserAPI.updatePswForced(editTarget.id, pwForm.pwd);
      setUsers((prev) =>
        prev.map((c) => (c.id === editTarget.id ? updated : c)),
      );
      showToast("Password aggiornata", "success");
      closeModalPassword();
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Errore durante il salvataggio",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  async function passwordValidation() {
    if (!pwForm.pwd || !pwForm.confirm) {
      showToast('Compila tutti i campi password', 'warning')
      return false
    }
    if (pwForm.pwd !== pwForm.confirm) {
      showToast('Le nuove password non coincidono', 'error')
      return false
    }
    if (pwForm.pwd.length < 6) {
      showToast('La password deve essere di almeno 6 caratteri', 'warning')
      return false
    }
    return true
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await UserAPI.disable(deleteTarget.id);
      setUsers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      showToast("Utente eliminato", "success");
      setDeleteTarget(null);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Errore durante l'eliminazione",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  }

  function exportCsv() {
    const header = ["Ruolo", "Nome", "Cognome", "Username", "Email", "DataCreazione", "DataUltimaModifica", "Attivo"];
    const rows = filtered.map((u) => [
      `"${u.userRole.toString().replace(/"/g, '""')}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.surname.replace(/"/g, '""')}"`,
      `"${u.username.replace(/"/g, '""')}"`,
      `"${u.email.replace(/"/g, '""')}"`,
      `"${formatDate(u.createdDate)}"`,
      `"${formatDate(u.lastUpdateDate)}"`,
      `"${!u.isDisabled}"`,
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "utenti.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    if (roleFilter !== '' && u.userRole !== roleFilter) return false;
    return (
      u.name.toLowerCase().includes(q) ||
      u.surname.toLowerCase().includes(q) ||
      u.email.toLocaleLowerCase().includes(q) ||
      u.username.toLocaleLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24,}}>
        <h1 className="page-title"> <i className="fa-solid fa-users-gear"></i> Utenti</h1>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <i className="fa-solid fa-circle-plus" /> Nuovo utente
          </button>
        </div>
      </div>

      <div className="grid-2 mb-24">
        <div className="kpi-card">
          <div className="kpi-icon"><i className="fa-solid fa-user-tie" /></div>
          <div className="kpi-label">Amministratori attivi</div>
          <div className="kpi-value">{users.filter(x => x.userRole === UserRole.Admin && !x.isDisabled).length}</div>
          <div className="kpi-delta">&nbsp;</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><i className="fa-solid fa-user-shield" /></div>
          <div className="kpi-label">Operatori attivi</div>
          <div className="kpi-value">{users.filter(x => x.userRole === UserRole.Operator && !x.isDisabled).length}</div>
          <div className="kpi-delta">&nbsp;</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-bar">
          <i className="fa-solid fa-magnifying-glass search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Cerca..."
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-control"
          style={{ width: 160 }}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value === '' ? '' : Number(e.target.value) as UserRole)}
        >
          <option value="">Tutti i ruoli</option>
          <option value={UserRole.Admin}>Admin</option>
          <option value={UserRole.Operator}>Operatore</option>
        </select>
        <div className="toolbar-right">
          <button className="btn btn-ghost btn-sm" onClick={exportCsv} title="Esporta CSV">
            <i className="fa-solid fa-download" /> Esporta
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrapper">
          <span className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          message={
            search ? "Nessun utente trovato" : "Nessun utente presente"
          }
          actionLabel={!search ? "Nuovo utente" : undefined}
          onAction={!search ? openCreate : undefined}
        />
      ) : (
        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ruolo</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Nome</th>
                  <th>Cognome</th>
                  <th>Data creazione</th>
                  <th>Data modifica</th>
                  <th>Attivo</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((usr) => (
                  <tr key={usr.id}>
                    <td>
                      <i className={usr.userRole == UserRole.Admin ? "fa-solid fa-user-tie" : "fa-solid fa-user-shield"}></i>
                    </td>
                    <td>
                      <strong>{usr.username}</strong>
                    </td>
                    <td>{usr.email}</td>
                    <td>{usr.name}</td>
                    <td>{usr.surname}</td>
                    <td>{formatDate(usr.createdDate)}</td>
                    <td>{formatDate(usr.lastUpdateDate)}</td>
                    <td>
                      <i className={usr.isDisabled ? "fa-solid fa-circle-xmark" : "fa-solid fa-circle-check"} style={{ color: usr.isDisabled ? 'var(--color-danger)' : 'var(--color-success)'}} />
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Modifica"
                          disabled={usr.userRole == UserRole.Admin}
                          onClick={() => openEdit(usr)}
                        >
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm btn-warning-hover"
                          title="Resetta la password"
                          disabled={usr.userRole == UserRole.Admin}
                          onClick={() => openPasswordReset(usr)}
                        >
                          <i className="fa-solid fa-key" />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          title="Elimina"
                          disabled={usr.userRole == UserRole.Admin}
                          onClick={() => setDeleteTarget(usr)}
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-muted text-sm">{filtered.length} utenti</span>
          </div>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editTarget ? "Modifica utente" : "Nuovo utente"}
        icon={editTarget ? "fa-solid fa-pen" : "fa-solid fa-plus"}
        footer={
          <>
            <button
              className="btn btn-ghost"
              onClick={closeModal}
              disabled={saving}
            >
              Annulla
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <span className="spinner" />
              ) : editTarget ? (
                "Salva modifiche"
              ) : (
                "Crea utente"
              )}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label" htmlFor="usr-username">
            Username <span className="required">*</span>
          </label>
          <input
            id="usr-username"
            type="text"
            className="form-control"
            placeholder="Username utente"
            maxLength={50}
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="usr-email">
            Email <span className="required">*</span>
          </label>
          <input
            id="usr-email"
            type="text"
            className="form-control"
            placeholder="Email utente"
            maxLength={50}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="usr-name">
            Nome <span className="required">*</span>
          </label>
          <input
            id="usr-name"
            type="text"
            className="form-control"
            placeholder="Nome utente"
            maxLength={50}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="usr-surname">
            Cognome <span className="required">*</span>
          </label>
          <input
            id="usr-surname"
            type="text"
            className="form-control"
            placeholder="Cognome utente"
            maxLength={50}
            value={form.surname}
            onChange={(e) => setForm((f) => ({ ...f, surname: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="usr-role">
            Ruolo
          </label>
          <select
            id="usr-role"
            className="form-control"
            value={form.userRole}
            onChange={(e) => setForm((f) => ({ ...f, userRole: Number(e.target.value) as UserRole }))}
          >
            <option value={UserRole.Admin}>Admin</option>
            <option value={UserRole.Operator}>Operatore</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">
            <input
              type="checkbox"
              checked={form.isDisabled}
              onChange={(e) => setForm((f) => ({ ...f, isDisabled: e.target.checked }))}
            />
            {' '}Disabilitato
          </label>
        </div>
        <div className="form-group" style={{ display: !editTarget ? 'block' : 'none' }}>
          <label className="form-label" htmlFor="usr-password">
            Password
          </label>
          <input
            id="usr-password"
            type="password"
            className="form-control"
            placeholder="••••••••"
            autoComplete="new-password"
            maxLength={50}
            value={pwForm.pwd}
            onChange={(e) => setPwForm((f) => ({ ...f, pwd: e.target.value }))}
          />
        </div>
        <div className="form-group" style={{ display: !editTarget ? 'block' : 'none' }}>
          <label className="form-label" htmlFor="usr-password-repeat">
            Ripeti la Password
          </label>
          <input
            id="usr-password-repeat"
            type="password"
            className="form-control"
            placeholder="••••••••"
            autoComplete="new-password"
            maxLength={50}
            value={pwForm.confirm}
            onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
          />
        </div>
      </Modal>

      <Modal
        isOpen={modalPasswordOpen}
        onClose={closeModalPassword}
        title={"Modifica forzatamente la password"}
        icon={"fa-solid fa-pen"}
        footer={
          <>
            <button
              className="btn btn-ghost"
              onClick={closeModalPassword}
              disabled={saving}
            >
              Annulla
            </button>
            <button
              className="btn btn-primary"
              onClick={handlePasswordReset}
              disabled={saving}
            >
              {saving ? <span className="spinner" /> : "Resetta la password"}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label" htmlFor="usr-pwd-reset">
            Nuova Password
          </label>
          <input
            id="usr-pwd-reset"
            type="password"
            className="form-control"
            placeholder="••••••••"
            autoComplete="new-password"
            maxLength={50}
            value={pwForm.pwd}
            onChange={(e) => setPwForm((f) => ({ ...f, pwd: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="usr-pwd-reset-repeat">
            Ripeti la Password
          </label>
          <input
            id="usr-pwd-reset-repeat"
            type="password"
            className="form-control"
            placeholder="••••••••"
            autoComplete="new-password"
            maxLength={50}
            value={pwForm.confirm}
            onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
          />
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`Sei sicuro di voler eliminare l'utente "${deleteTarget?.username}"? Questa azione non può essere annullata.`}
        loading={deleting}
      />
    </div>
  );
}
