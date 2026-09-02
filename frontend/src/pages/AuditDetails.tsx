import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Audit, AUDIT_ACTION_LABEL, AUDIT_ENTITY_LABEL } from "../types";
import { useToast } from "../context/ToastContext";
import EmptyState from "../components/ui/EmptyState";
import { AuditAPI } from "../services/api";

function prettyJson(raw?: string) {
  if (!raw) return null;
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export default function AuditDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [log, setLog] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadLog(Number(id));
  }, [id]);

  async function loadLog(logId: number) {
    setLoading(true);
    try {
      const result = await AuditAPI.getById(logId);
      setLog(result);
      document.title = `Audit #${result.id} - GestioPro`;
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Errore nel caricamento del log",
        "error",
      );
      setLog(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center" style={{ padding: "64px 0" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!log) {
    return (
      <div>
        <button className="btn btn-ghost" onClick={() => navigate("/audit")}>
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />
          Torna all'audit
        </button>
        <EmptyState message="Log non trovato" />
      </div>
    );
  }

  const oldValues = prettyJson(log.oldValues);
  const newValues = prettyJson(log.newValues);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 className="page-title">
          <i className="fa-solid fa-scroll"></i> Audit Dettaglio
        </h1>
        <button className="btn btn-ghost" onClick={() => navigate("/audit")}>
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />
          Torna all'audit
        </button>
      </div>

      <div className="card mb-24">
        <div className="card-header">Informazioni generali</div>
        <div className="card-body">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label"><strong>Data e ora</strong></label>
              <div>{new Date(log.timestamp).toLocaleString("it-IT")}</div>
            </div>
            <div className="form-group">
              <label className="form-label"><strong>Azione</strong></label>
              <div>{AUDIT_ACTION_LABEL[log.action] ?? log.action}</div>
            </div>
            <div className="form-group">
              <label className="form-label"><strong>Entità</strong></label>
              <div>{AUDIT_ENTITY_LABEL[log.entityType] ?? log.entityType}</div>
            </div>
            <div className="form-group">
              <label className="form-label"><strong>Id entità</strong></label>
              <div>{log.entityId}</div>
            </div>
            <div className="form-group">
              <label className="form-label"><strong>Utente</strong></label>
              <div>{log.username}</div>
            </div>
            <div className="form-group">
              <label className="form-label"><strong>Id utente</strong></label>
              <div>{log.userId}</div>
            </div>
            <div className="form-group">
              <label className="form-label"><strong>Indirizzo IP</strong></label>
              <div>{log.ipAddress ?? "-"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span><i className="fa-solid fa-x"></i> Valori precedenti</span></div>
          <div className="card-body">
            {oldValues ? (
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: 13, margin: 0 }}>
                {oldValues}
              </pre>
            ) : (
              <span className="text-muted">Nessun valore precedente</span>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span><i className="fa-solid fa-check"></i> Nuovi valori</span></div>
          <div className="card-body">
            {newValues ? (
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: 13, margin: 0 }}>
                {newValues}
              </pre>
            ) : (
              <span className="text-muted">Nessun nuovo valore</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
