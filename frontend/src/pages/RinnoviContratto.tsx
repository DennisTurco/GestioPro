import { useState, useEffect, useMemo } from "react";
import type { ContractRenewal } from "../types";
import { formatDate } from "../utils/date";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ui/ConfirmModal";
import { ContractRenewalAPI } from "../services/api";
import { useParams } from "react-router-dom";

export default function RinnoviContratto() {
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast();

const [search, setSearch] = useState('')

  const [renewals, setRenewals] = useState<ContractRenewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, _] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ContractRenewal | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return
    const numId = Number(id)
    document.title = "Rinnovi - GestioPro";
    loadRenewals(numId);
  }, [id]);

  const filteredRenewals = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return renewals;
    return renewals.filter(
      (r) =>
        String(r.amount).toLowerCase().includes(q) ||
        (r.notes ?? "").toLowerCase().includes(q),
    );
  }, [renewals, search]);

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

  async function loadRenewals(id: number) {
    setLoading(true);
    try {
      const renewals = await ContractRenewalAPI.getByContractId(id);
      setRenewals(renewals);
    } catch (err: unknown) {
      showToast(
        err instanceof Error
          ? err.message
          : "Errore nel caricamento dei rinnovi",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await ContractRenewalAPI.delete(deleteTarget.id);
      setRenewals((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      showToast("Rinnovo eliminato", "success");
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
    const header = [
      "Importo",
      "DataInizio",
      "DataFine",
      "DataRinnovo",
      "Note",
    ];
    const rows = filteredRenewals.map((r) => [
      `"${r.amount}"`,
      `"${formatDate(r.startDate)}"`,
      `"${formatDate(r.endDate)}"`,
      `"${formatDate(r.renewalDate)}"`,
      `"${r.notes ?? ''}"`,
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rinnovi.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24,}}>
        <h1 className="page-title"> <i className="fa-solid fa-rotate-right"></i> Rinnovi Contratto</h1>
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
    <div className="toolbar-right">
        <button className="btn btn-ghost btn-sm" onClick={exportCsv} title="Esporta CSV">
        <i className="fa-solid fa-download" /> Esporta
        </button>
    </div>
    </div>

    <div>
        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Importo</th>
                  <th>DataInizio</th>
                  <th>DataFine</th>
                  <th>DataRinnovo</th>
                  {/* <th>Azioni</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredRenewals.map((ren) => (
                  <tr key={ren.id}>
                    <td>{ren.amount}</td>
                    <td>{formatDate(ren.startDate)}</td>
                    <td>{formatDate(ren.endDate)}</td>
                    <td>{formatDate(ren.renewalDate)}</td>
                    {/* <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-danger btn-sm"
                          title="Elimina"
                          onClick={() => setDeleteTarget(ren)}
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            className="card-footer"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <span className="text-muted text-sm">{filteredRenewals.length} rinnovi</span>
          </div>
        </div>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message="Sei sicuro di voler cancellare il rinnovo? Questa azione non può essere annullata."
        loading={deleting}
      />
    </div>
    </div>
  );
}
