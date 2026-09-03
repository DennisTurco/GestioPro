import { useEffect, useState, useMemo } from "react";
import { ContractAPI, QuotationAPI, SettingsAPI } from "../services/api";
import type { Contract, ContractRequest, Quotation, Setting } from "../types";
import {
  ContractType,
  CONTRACT_TYPE_LABEL,
  CONTRACT_STATUS_CLS,
  QuotationStatus,
} from "../types";
import { formatDate } from "../utils/date";
import { formatCurrency } from "../utils/currency";
import { useToast } from "../context/ToastContext";
import Modal from "../components/ui/Modal";
import ConfirmModal from "../components/ui/ConfirmModal";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import { getSettingValue } from "../utils/settings";
import { Navigate, useNavigate } from "react-router-dom";

interface FormState {
  quotationId: number;
  contractType: string;
  number: string;
  title: string;
  amount: string;
  totalAmount: string;
  finalAmount: string;
  vatPercentage: string;
  startDate: string;
  endDate: string;
  description: string;
  notes: string;
}

const emptyForm = (): FormState => ({
  quotationId: 0,
  contractType: String(ContractType.Semestral),
  number: "",
  title: "",
  amount: "",
  totalAmount: "",
  finalAmount: "",
  vatPercentage: "22",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  description: "",
  notes: "",
});

function statusBadgeCls(status: string): string {
  return CONTRACT_STATUS_CLS[status] ?? "badge-muted";
}

export default function Contratti() {
  const navigate = useNavigate()
  const { showToast } = useToast();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Contract | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [numberLoading, setNumberLoading] = useState(false);

  const [renewTarget, setRenewTarget] = useState<Contract | null>(null);
  const [renewing, setRenewing] = useState(false);

  const [page, setPage] = useState(1)
  const pageSize = 20

  function kpiFor(status: string) {
    const rows = contracts.filter((c) => c.status === status);
    return {
      count: rows.length,
      sum: rows.reduce((s, p) => s + (p.amount ?? 0), 0),
    };
  }

  const kpiTotal = {
    count: contracts.length,
    sum: contracts.reduce((s, c) => s + (c.amount ?? 0), 0),
  };
  const kpiActive = kpiFor("Attivo");
  const kpiExpiring = kpiFor("In scadenza");
  const kpiExpired = kpiFor("Scaduto");

  useEffect(() => {
    document.title = "Contratti - GestioPro";
    loadData();
  }, []);

  useEffect(() => {
    setPage(1)
  }, [search, typeFilter, statusFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const [cList, qList, sList] = await Promise.all([
        ContractAPI.getAll(),
        QuotationAPI.getAll(),
        SettingsAPI.getAll(),
      ]);
      setContracts(cList);
      setQuotations(
        qList.filter((q) => q.quotationStatus === QuotationStatus.Accepted),
      );
      setSettings(sList);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Errore nel caricamento",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return contracts.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.number.toLowerCase().includes(q);
      const matchType = !typeFilter || String(c.contractType) === typeFilter;
      const matchStatus = !statusFilter || c.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [contracts, search, typeFilter, statusFilter]);

  async function openCreate() {
    setEditTarget(null);
    setForm({
      ...emptyForm(),
      vatPercentage: getSettingValue(settings, "VatPercentage") ?? "22",
    });
    setModalOpen(true);
  }

  function openEdit(c: Contract) {
    setEditTarget(c);
    setForm({
      quotationId: c.quotationId,
      contractType: String(c.contractType),
      number: c.number,
      totalAmount: String(c.totalAmount),
      finalAmount: String(getTotalAmount(c.amount, c.vatPercentage, 0)),
      title: c.title,
      amount: String(c.amount),
      vatPercentage: String(c.vatPercentage),
      startDate: c.startDate,
      endDate: c.endDate,
      description: c.description ?? "",
      notes: c.notes ?? "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditTarget(null);
    setForm(emptyForm());
  }

  async function handleQuotationChange(quotationId: number) {
    setForm((f) => ({ ...f, quotationId }));
    if (!quotationId) return;

    const q = quotations.find((q) => q.id === quotationId);
    if (q) {
      setForm((f) => ({
        ...f,
        quotationId,
        title: f.title || q.title,
        amount: f.amount || String(q.amount),
        description: f.description || (q.description ?? ""),
      }));
    }

    setNumberLoading(true);
    try {
      const num = await ContractAPI.getNextNumber(quotationId, q?.number ?? "");
      setForm((f) => ({ ...f, number: num }));
    } catch {
      showToast(
        "Numero non generato automaticamente, inseriscilo a mano",
        "warning",
      );
    } finally {
      setNumberLoading(false);
    }
  }

  async function handleSave() {
    if (!form.quotationId) {
      showToast("Seleziona il preventivo collegato", "warning");
      return;
    }
    if (!form.number.trim() || !form.title.trim()) {
      showToast("Numero e titolo sono obbligatori", "warning");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      showToast("Inserisci un importo valido", "warning");
      return;
    }
    const payload: ContractRequest = {
      quotationId: Number(form.quotationId),
      contractType: Number(form.contractType) as ContractType,
      number: form.number.trim(),
      title: form.title.trim(),
      amount: Number(form.amount),
      vatPercentage: Number(form.vatPercentage),
      startDate: form.startDate,
      description: form.description || undefined,
      notes: form.notes || undefined,
    };

    setSaving(true);
    try {
      if (editTarget) {
        const updated = await ContractAPI.update(editTarget.id, payload);
        setContracts((prev) =>
          prev.map((c) => (c.id === editTarget.id ? updated : c)),
        );
        showToast("Contratto aggiornato", "success");
      } else {
        await ContractAPI.create(payload);
        await loadData();
        showToast("Contratto creato", "success");
      }
      closeModal();
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Errore nel salvataggio",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRenewal() {
    if (!renewTarget) return;
    setRenewing(true);
    try {
      const renewed = await ContractAPI.renewal(renewTarget.id);
      setContracts((prev) =>
        prev.map((c) => (c.id === renewTarget.id ? renewed : c)),
      );
      showToast("Contratto rinnovato", "success");
      setRenewTarget(null);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Errore nel rinnovo",
        "error",
      );
    } finally {
      setRenewing(false);
    }
  }

  function exportCsv() {
    const rows = [
      ["N&#176;", "Titolo", "Tipo", "Stato", "Importo", "IVA%", "Inizio", "Fine"],
      ...filtered.map((c) => [
        c.number,
        c.title,
        CONTRACT_TYPE_LABEL[c.contractType] ?? "",
        c.status,
        String(c.amount),
        String(c.vatPercentage),
        c.startDate,
        c.endDate,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contratti.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleVatPercentageChange(value: string) {

    value = fixPercentageValueIfOutOfBoundary(Number(value))

    setForm(prev => ({
        ...prev,
        vatPercentage: value,
        finalAmount: String(getTotalAmount(parseFloat(prev.amount) || 0, parseFloat(value) || 0, 0)),
    }))
  }

  function handleAmountChange(value: string) {
    setForm(prev => ({
        ...prev,
        amount: value,
        finalAmount: String(getTotalAmount(parseFloat(value) || 0, parseFloat(prev.vatPercentage) || 0, 0)),
    }))
  }

  function fixPercentageValueIfOutOfBoundary(percentage: number) : string {
    if (percentage < 0)
        return "0"
    else if (percentage > 100)
        return "100"
    return String(percentage)
  }

  function getTotalAmount(amount: number, vatPercentage: number, discountPercentage: number) {
    const discount = amount * discountPercentage / 100;
    amount -= discount;
    const vatAmount = amount * vatPercentage / 100;
    return amount + vatAmount;
  }

  const statuses = [...new Set(contracts.map((c) => c.status))];

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24,}}>
        <h1 className="page-title"> <i className="fa-solid fa-file-contract" /> Contratti</h1>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <i className="fa-solid fa-circle-plus" /> Nuovo contratto
          </button>
        </div>
      </div>

      <div className="grid-4 mb-24">
        <div className="kpi-card">
          <div className="kpi-icon">
            <i className="fa-solid fa-receipt" />
          </div>
          <div className="kpi-label">Totale contratti</div>
          <div className="kpi-value">{kpiTotal.count}</div>
          <div className="kpi-delta">{formatCurrency(kpiTotal.sum)}</div>
        </div>
        <div className="kpi-card">
          <div
            className="kpi-icon"
            style={{
              background: "var(--color-surface-hover)",
              color: "var(--color-text-muted)",
            }}
          >
            <i className="fa-solid fa-circle-check" />
          </div>
          <div className="kpi-label">Attivi</div>
          <div className="kpi-value">{kpiActive.count}</div>
          <div className="kpi-delta">{formatCurrency(kpiActive.sum)}</div>
        </div>
        <div className="kpi-card">
          <div
            className="kpi-icon"
            style={{
              background: "var(--color-warning-bg)",
              color: "var(--color-warning)",
            }}
          >
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
          <div className="kpi-label">In scadenza</div>
          <div className="kpi-value">{kpiExpiring.count}</div>
          <div className="kpi-delta">{formatCurrency(kpiExpiring.sum)}</div>
        </div>
        <div className="kpi-card">
          <div
            className="kpi-icon"
            style={{
              background: "var(--color-danger-bg)",
              color: "var(--color-danger)",
            }}
          >
            <i className="fa-regular fa-circle-xmark" />
          </div>
          <div className="kpi-label">Scaduti</div>
          <div className="kpi-value">{kpiExpired.count}</div>
          <div className="kpi-delta">{formatCurrency(kpiExpired.sum)}</div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <i className="fa-solid fa-magnifying-glass search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Cerca per titolo o numero..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-control"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ width: 160 }}
        >
          <option value="">Tutti i tipi</option>
          {Object.entries(CONTRACT_TYPE_LABEL).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="form-control"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: 140 }}
        >
          <option value="">Tutti gli stati</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="toolbar-right">
          <button className="btn btn-ghost btn-sm" onClick={exportCsv} title="Esporta CSV">
            <i className="fa-solid fa-download" /> Esporta
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          message={
            search || typeFilter || statusFilter
              ? "Nessun contratto trovato"
              : "Nessun contratto presente"
          }
          actionLabel={
            !search && !typeFilter && !statusFilter
              ? "Nuovo contratto"
              : undefined
          }
          onAction={
            !search && !typeFilter && !statusFilter ? openCreate : undefined
          }
        />
      ) : (
        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>N&#176;</th>
                  <th>Titolo</th>
                  <th>Tipo</th>
                  <th>Stato</th>
                  <th>Importo</th>
                  <th>Inizio</th>
                  <th>Fine</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((c) => (
                  <tr key={c.id} onClick={() => navigate(`/rinnovi/${c.id}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <code style={{ fontSize: 12 }}>{c.number}</code>
                    </td>
                    <td>{c.title}</td>
                    <td>{CONTRACT_TYPE_LABEL[c.contractType] ?? "—"}</td>
                    <td>
                      <Badge cls={statusBadgeCls(c.status)}>{c.status}</Badge>
                    </td>
                    <td>{formatCurrency(c.amount)}</td>
                    <td>{formatDate(c.startDate)}</td>
                    <td>
                      {c.endDate ? (
                        formatDate(c.endDate)
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Modifica"
                          onClick={() => openEdit(c)}
                        >
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button
                        className="btn btn-ghost btn-sm"
                        title="Lista rinnovi"
                        onClick={() => navigate(`/rinnovi/${c.id}`)}
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square" />
                      </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Rinnova"
                          onClick={() => setRenewTarget(c)}
                        >
                          <i className="fa-solid fa-rotate-right" />
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
              {filtered.length} contratti
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

      {/* ── MODAL CREA / MODIFICA ── */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editTarget ? "Modifica contratto" : "Nuovo contratto"}
        icon="fa-solid fa-file-contract"
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
                "Salva"
              ) : (
                "Crea"
              )}
            </button>
          </>
        }
      >
        <div className="form-row">
          {/* Preventivo collegato */}
          <div className="form-group form-group-full">
            <label className="form-label">
              Preventivo <span className="required">*</span>
            </label>
            <select
              className="form-control"
              value={form.quotationId}
              onChange={(e) => handleQuotationChange(Number(e.target.value))}
              disabled={!!editTarget}
            >
              <option value="">— Seleziona preventivo accettato —</option>
              {quotations.map((q) => (
                <option key={q.id} value={String(q.id)}>
                  #{q.number} — {q.title} ({q.customerName})
                </option>
              ))}
            </select>
          </div>

          {/* Numero */}
          <div className="form-group">
            <label className="form-label">
              Numero <span className="required">*</span>
              {numberLoading && (
                <span
                  className="spinner"
                  style={{ marginLeft: 8, width: 12, height: 12 }}
                />
              )}
            </label>
            <input
              type="text"
              className="form-control"
              value={form.number}
              onChange={(e) =>
                setForm((f) => ({ ...f, number: e.target.value }))
              }
              disabled={true}
            />
          </div>

          {/* Titolo */}
          <div className="form-group">
            <label className="form-label">
              Titolo <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Titolo del contratto"
              maxLength={200}
            />
          </div>

          {/* Tipo contratto */}
          <div className="form-group">
            <label className="form-label">Tipo di contratto</label>
            <select
              className="form-control"
              value={form.contractType}
              onChange={(e) =>
                setForm((f) => ({ ...f, contractType: e.target.value }))
              }
              disabled={editTarget ? true : false}
            >
              {Object.entries(CONTRACT_TYPE_LABEL).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Data inizio */}
          <div className="form-group">
            <label className="form-label">
              Data inizio <span className="required">*</span>
            </label>
            <input
              type="date"
              className="form-control"
              value={form.startDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, startDate: e.target.value }))
              }
              disabled={editTarget ? true : false}
            />
          </div>

          {/* Data fine */}
          <div
            className="form-group"
            style={{ display: editTarget ? "block" : "none" }}
          >
            <label className="form-label">Data fine</label>
            <input
              type="date"
              disabled={true}
              className="form-control"
              value={form.endDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, endDate: e.target.value }))
              }
            />
          </div>

          {/* Importo */}
          <div className="form-group">
            <label className="form-label">
              Importo (€) <span className="required">*</span>
            </label>
            <input
              type="number"
              className="form-control"
              value={form.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              min={0}
              step={0.01}
            />
          </div>

          {/* Ricavo Totale */}
          <div
            className="form-group"
            style={{ display: editTarget ? "block" : "none" }}
          >
            <label className="form-label">Ricavo Totale (€)</label>
            <input
              type="number"
              className="form-control"
              value={form.totalAmount}
              placeholder="0.00"
              disabled={true}
            />
          </div>

          {/* IVA */}
          <div className="form-group">
            <label className="form-label">IVA %</label>
            <input
              type="number"
              className="form-control"
              value={form.vatPercentage}
              onChange={(e) => handleVatPercentageChange(e.target.value)}
              min={0}
              max={100}
            />
          </div>

          {/* Totale con iva */}
          <div className="form-group form-group-full">
            <label className="form-label">Importo Finale (€)</label>
            <input
            type="number"
            className="form-control"
            value={form.finalAmount}
            disabled={true}
            title={"Applicata l'iva"}
            />
        </div>

          {/* Descrizione */}
          <div className="form-group form-group-full">
            <label className="form-label">Descrizione</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Descrizione del contratto..."
              maxLength={2000}
            />
          </div>

          {/* Note */}
          <div className="form-group form-group-full">
            <label className="form-label">Note</label>
            <textarea
              className="form-control"
              rows={2}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Note interne..."
              maxLength={1000}
            />
          </div>
        </div>
      </Modal>

      {/* ── CONFIRM RINNOVO ── */}
      <ConfirmModal
        isOpen={renewTarget !== null}
        onClose={() => setRenewTarget(null)}
        onConfirm={handleRenewal}
        loading={renewing}
        buttonText={"Rinnova"}
        title={"Conferma Rinnovo"}
        message={
          renewTarget
            ? `Rinnova il contratto "${renewTarget.title}"? La data di fine verrà estesa in base al tipo (${CONTRACT_TYPE_LABEL[renewTarget.contractType]}).`
            : ""
        }
      />
    </div>
  );
}
