import { useState, useEffect } from "react";
import { Audit, AUDIT_ACTION_LABEL, AUDIT_ENTITY_LABEL } from "../types";
import { useToast } from "../context/ToastContext";
import EmptyState from "../components/ui/EmptyState";
import { AuditAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Audit() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [logs, setLogs] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, _] = useState(false);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    document.title = "Audit - GestioPro";
    loadLogs();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, actionFilter, entityFilter, userFilter]);

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

  async function loadLogs() {
    setLoading(true);
    try {
      const logs = await AuditAPI.getAll();
      setLogs(logs);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Errore nel caricamento dei logs",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    const header = [
      "Timestamp",
      "IdUtente",
      "Username",
      "Azione",
      "Entità",
      "IdEntità",
      "VecchiValori",
      "NuoviValori",
      "IndirizzoIP",
    ];
    const rows = filtered.map((a) => [
      `"${new Date(a.timestamp).toLocaleString("it-IT")}"`,
      `"${a.userId.replace(/"/g, '""')}"`,
      `"${a.username.replace(/"/g, '""')}"`,
      `"${a.action.replace(/"/g, '""')}"`,
      `"${a.entityType.replace(/"/g, '""')}"`,
      `"${a.entityId.toString().replace(/"/g, '""')}"`,
      `"${a.oldValues?.replace(/"/g, '""')}"`,
      `"${a.newValues?.replace(/"/g, '""')}"`,
      `"${a.ipAddress?.replace(/"/g, '""')}"`,
    ]);
    const csv = [header.join(","), ...rows.map((a) => a.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = logs
    .filter((a) => {
      if (actionFilter !== "" && a.action !== actionFilter) return false;
      if (entityFilter !== "" && a.entityType !== entityFilter) return false;
      if (userFilter !== "" && a.username !== userFilter) return false;

      const q = search.toLowerCase();
      if (!q) return true;
      return (
        a.timestamp.toString().toLowerCase().includes(q) ||
        a.userId.toString().toLowerCase().includes(q) ||
        a.username.toLocaleLowerCase().includes(q)
      );
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  const actionOptions = Array.from(new Set(logs.map((l) => l.action)));
  const entityOptions = Array.from(new Set(logs.map((l) => l.entityType)));
  const userOptions = Array.from(new Set(logs.map((l) => l.username)));

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1 className="page-title">
          {" "}
          <i className="fa-solid fa-scroll"></i> Audit
        </h1>
      </div>

      <div className="filter-bar">
        <div className="search-bar">
          <i className="fa-solid fa-magnifying-glass search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Cerca per utente o data"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-control"
          style={{ width: 160 }}
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
        >
          <option value="">Tutti gli utenti</option>
          {userOptions.map((a) => (
            <option key={a} value={a}> {a} </option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: 160 }}
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="">Tutte le azioni</option>
          {actionOptions.map((a) => (
            <option key={a} value={a}>
              {AUDIT_ACTION_LABEL[a] ?? a}
            </option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: 160 }}
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
        >
          <option value="">Tutte le entità</option>
          {entityOptions.map((et) => (
            <option key={et} value={et}>
              {AUDIT_ENTITY_LABEL[et] ?? et}
            </option>
          ))}
        </select>
        <div className="toolbar-right">
          <button
            className="btn btn-ghost btn-sm"
            onClick={exportCsv}
            title="Esporta CSV"
          >
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
            search || actionFilter || entityFilter
              ? "Nessun log trovato"
              : "Nessun log presente"
          }
        />
      ) : (
        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Id Utente</th>
                  <th>Username</th>
                  <th>Azione</th>
                  <th>Entità</th>
                  <th>Id Entità</th>
                  <th>Indirizzo IP</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => navigate(`/audit-details/${log.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{new Date(log.timestamp).toLocaleString("it-IT")}</td>
                    <td>{log.userId.toString()}</td>
                    <td>{log.username}</td>
                    <td>{AUDIT_ACTION_LABEL[log.action] ?? log.action}</td>
                    <td>
                      {AUDIT_ENTITY_LABEL[log.entityType] ?? log.entityType}
                    </td>
                    <td>{log.entityId}</td>
                    <td>{log.ipAddress}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Pagina Dettagli"
                          onClick={() => navigate(`/audit-details/${log.id}`)}
                        >
                          <i className="fa-solid fa-eye" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            className="card-footer"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span className="text-muted text-sm">
              {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, filtered.length)} di{" "}
              {filtered.length} log
            </span>
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  title="Pagina precedente"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
                <span className="text-muted text-sm">
                  Pagina {currentPage} di {totalPages}
                </span>
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  title="Pagina successiva"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
