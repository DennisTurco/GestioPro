import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Audit, AUDIT_ACTION_LABEL, AUDIT_ENTITY_LABEL } from "../types";
import { useToast } from "../context/ToastContext";
import EmptyState from "../components/ui/EmptyState";
import { AuditAPI } from "../services/api";

type JsonObject = Record<string, unknown>;
type ChangeKind = "added" | "removed" | "changed" | "same";

interface FieldChange {
  key: string;
  before: unknown;
  after: unknown;
  kind: ChangeKind;
}

const ACTION_STYLE: Record<string, { icon: string; tone: string }> = {
  Create: { icon: "fa-plus", tone: "success" },
  Update: { icon: "fa-pen", tone: "warning" },
  Delete: { icon: "fa-trash", tone: "danger" },
};

const KIND_LABEL: Record<ChangeKind, string> = {
  added: "Aggiunto",
  removed: "Rimosso",
  changed: "Modificato",
  same: "Invariato",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function prettyJson(raw?: string) {
  if (!raw) return null;
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

function parseObject(raw?: string): JsonObject | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// Compares the two objects key by key, so it works regardless of which keys exist or their order
function diffObjects(before: JsonObject | null, after: JsonObject | null): FieldChange[] {
  const keys = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])];
  return keys.map((key) => {
    const b = before?.[key];
    const a = after?.[key];
    let kind: ChangeKind = "same";
    if (before && after) {
      if (!(key in before)) kind = "added";
      else if (!(key in after)) kind = "removed";
      else if (JSON.stringify(b) !== JSON.stringify(a)) kind = "changed";
    }
    return { key, before: b, after: a, kind };
  });
}

function FieldValue({ value }: { value: unknown }) {
  if (value === undefined) return <span className="audit-value-empty">—</span>;
  if (value === null) return <span className="audit-value-empty">null</span>;
  if (value === "") return <span className="audit-value-empty">vuoto</span>;
  if (typeof value === "boolean") return <span>{value ? "Sì" : "No"}</span>;
  if (typeof value === "string" && ISO_DATE.test(value)) {
    return <span title={value}>{new Date(value).toLocaleString("it-IT")}</span>;
  }
  if (typeof value === "object") {
    return <pre className="audit-value-json">{JSON.stringify(value, null, 2)}</pre>;
  }
  return <span>{String(value)}</span>;
}

export default function AuditDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [log, setLog] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

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

  const oldRaw = prettyJson(log.oldValues);
  const newRaw = prettyJson(log.newValues);
  const oldObject = parseObject(log.oldValues);
  const newObject = parseObject(log.newValues);

  const isComparison = oldObject !== null && newObject !== null;
  const changes = diffObjects(oldObject, newObject);
  const changedCount = changes.filter((c) => c.kind !== "same").length;
  const visibleChanges = isComparison && !showAll ? changes.filter((c) => c.kind !== "same") : changes;
  const counts = {
    changed: changes.filter((c) => c.kind === "changed").length,
    added: changes.filter((c) => c.kind === "added").length,
    removed: changes.filter((c) => c.kind === "removed").length,
  };

  const style = ACTION_STYLE[log.action] ?? { icon: "fa-scroll", tone: "neutral" };
  const actionLabel = AUDIT_ACTION_LABEL[log.action] ?? log.action;
  const entityLabel = AUDIT_ENTITY_LABEL[log.entityType] ?? log.entityType;
  const timestamp = new Date(log.timestamp);

  // Create has only "after" values, Delete only "before"
  const showBefore = oldObject !== null;
  const showAfter = newObject !== null;

  return (
    <div className="audit-detail">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="page-title">
          <i className="fa-solid fa-scroll"></i> Audit Dettaglio
        </h1>
        <button className="btn btn-ghost" onClick={() => navigate("/audit")}>
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />
          Torna all'audit
        </button>
      </div>

      <div className={`card audit-hero audit-tone-${style.tone}`}>
        <div className="audit-hero-top">
          <div className="audit-hero-icon">
            <i className={`fa-solid ${style.icon}`} />
          </div>
          <div className="audit-hero-main">
            <div className="audit-hero-eyebrow">Log #{log.id}</div>
            <h2 className="audit-hero-title">
              {actionLabel} · {entityLabel} <span className="audit-hero-entity">#{log.entityId}</span>
            </h2>
            <div className="audit-hero-sub">
              di <strong>{log.username}</strong> · {timestamp.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
              {" alle "}
              {timestamp.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          {isComparison && (
            <div className="audit-hero-count">
              <span className="audit-hero-count-num">{changedCount}</span>
              <span className="audit-hero-count-label">{changedCount === 1 ? "campo modificato" : "campi modificati"}</span>
            </div>
          )}
        </div>

        <dl className="audit-meta">
          <div className="audit-meta-item">
            <dt><i className="fa-regular fa-clock" /> Data e ora</dt>
            <dd>{timestamp.toLocaleString("it-IT")}</dd>
          </div>
          <div className="audit-meta-item">
            <dt><i className="fa-regular fa-user" /> Utente</dt>
            <dd>
              {log.username}
              <span className="audit-meta-sub" title={log.userId}>{log.userId}</span>
            </dd>
          </div>
          <div className="audit-meta-item">
            <dt><i className="fa-solid fa-cube" /> Entità</dt>
            <dd>{entityLabel} <span className="text-muted">#{log.entityId}</span></dd>
          </div>
          <div className="audit-meta-item">
            <dt><i className="fa-solid fa-network-wired" /> Indirizzo IP</dt>
            <dd className="audit-mono">{log.ipAddress ?? "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="card audit-changes">
        <div className="card-header">
          <span><i className="fa-solid fa-code-compare" /> {isComparison ? "Modifiche" : "Valori"}</span>
          {isComparison && (
            <div className="audit-toolbar">
              {counts.changed > 0 && <span className="audit-chip audit-chip-changed">{counts.changed} modificati</span>}
              {counts.added > 0 && <span className="audit-chip audit-chip-added">{counts.added} aggiunti</span>}
              {counts.removed > 0 && <span className="audit-chip audit-chip-removed">{counts.removed} rimossi</span>}
              <div className="audit-segment" role="group" aria-label="Filtro campi">
                <button className={!showAll ? "active" : ""} onClick={() => setShowAll(false)}>Solo modifiche</button>
                <button className={showAll ? "active" : ""} onClick={() => setShowAll(true)}>Tutti i campi</button>
              </div>
            </div>
          )}
        </div>

        {changes.length === 0 ? (
          <div className="card-body text-muted">Nessun valore strutturato da mostrare.</div>
        ) : visibleChanges.length === 0 ? (
          <div className="audit-empty">
            <i className="fa-solid fa-equals" />
            <span>Nessuna differenza tra i valori precedenti e quelli nuovi.</span>
          </div>
        ) : (
          <div className={`audit-diff ${showBefore && showAfter ? "" : "audit-diff-single"}`}>
            <div className="audit-diff-head">
              <span>Campo</span>
              {showBefore && <span>{showAfter ? "Prima" : "Valore eliminato"}</span>}
              {showAfter && <span>{showBefore ? "Dopo" : "Valore creato"}</span>}
            </div>
            {visibleChanges.map((c) => (
              <div key={c.key} className={`audit-diff-row is-${c.kind}`}>
                <div className="audit-diff-key">
                  <span className="audit-mono">{c.key}</span>
                  {c.kind !== "same" && <span className={`audit-kind audit-kind-${c.kind}`}>{KIND_LABEL[c.kind]}</span>}
                </div>
                {showBefore && (
                  <div className="audit-diff-cell audit-diff-before" data-label={showAfter ? "Prima" : "Valore"}>
                    <FieldValue value={c.before} />
                  </div>
                )}
                {showAfter && (
                  <div className="audit-diff-cell audit-diff-after" data-label={showBefore ? "Dopo" : "Valore"}>
                    <FieldValue value={c.after} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {(oldRaw || newRaw) && (
        <details className="card audit-raw" open={!oldObject && !newObject}>
          <summary>
            <i className="fa-solid fa-code" /> JSON originale
            <i className="fa-solid fa-chevron-down audit-raw-chevron" />
          </summary>
          <div className="audit-raw-body">
            <div>
              <div className="audit-raw-label">Valori precedenti</div>
              {oldRaw ? <pre>{oldRaw}</pre> : <span className="text-muted">Nessun valore precedente</span>}
            </div>
            <div>
              <div className="audit-raw-label">Nuovi valori</div>
              {newRaw ? <pre>{newRaw}</pre> : <span className="text-muted">Nessun nuovo valore</span>}
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
