import { useState, useEffect, useMemo } from "react";
import { marked } from "marked";
import { QuotationAPI, ClientiAPI, SettingsAPI, ProductAPI } from "../services/api";
import type { Quotation, QuotationRequest, Customer, Setting, Product } from "../types";
import { QuotationStatus, QUOTATION_STATUS_INFO } from "../types";
import { fixPercentageValueIfOutOfBoundary, formatCurrency, getTotalAmount, normalizeDecimalInput } from "../utils/currency";
import { formatDate, toDateInput } from "../utils/date";
import { useToast } from "../context/ToastContext";
import Modal from "../components/ui/Modal";
import ConfirmModal from "../components/ui/ConfirmModal";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import QuotationProductsPicker, { type QuotationProductFormItem } from "../components/quotations/QuotationProductsPicker";
import { getSettingValue } from "../utils/settings";

interface FormState {
  number: string;
  customerId: string;
  title: string;
  description: string;
  amount: string;
  vatPercentage: string;
  discountPercentage: string;
  issueDate: string;
  validityDate: string;
  quotationStatus: string;
  notes: string;
  totalAmount: string;
}

const emptyForm = (): FormState => ({
  number: "",
  customerId: "",
  title: "",
  description: "",
  amount: "",
  vatPercentage: "22",
  discountPercentage: "0",
  issueDate: "",
  validityDate: "",
  quotationStatus: String(QuotationStatus.Draft),
  notes: "",
  totalAmount: "",
});

export default function Preventivi() {
  const { showToast } = useToast();

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(
    null,
  );
  const [form, setForm] = useState<FormState>(emptyForm());
  const [formItems, setFormItems] = useState<QuotationProductFormItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [numberLoading, setNumberLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Quotation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => {
    document.title = "Preventivi - GestioPro";
  }, []);

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, customerFilter]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      QuotationAPI.getAll(),
      ClientiAPI.getAll(),
      SettingsAPI.getAll(),
      ProductAPI.getAll(),
    ])
      .then(([q, c, s, p]) => {
        setQuotations(q);
        setCustomers(c);
        setSettings(s);
        setProducts(p);
      })
      .catch(() => showToast("Errore nel caricamento dei dati", "error"))
      .finally(() => setLoading(false));
  }, []);

  function handleVatPercentageChange(value: string) {
    value = normalizeDecimalInput(value)
    const valNumber = Number(Number(value).toFixed(2))
    value = fixPercentageValueIfOutOfBoundary(valNumber)

    setForm(prev => ({
        ...prev,
        vatPercentage: value,
        totalAmount: String(getTotalAmount(parseFloat(prev.amount) || 0, parseFloat(value) || 0, parseFloat(prev.discountPercentage) || 0)),
    }))
  }

  function handleDiscountPercentageChange(value: string) {
    value = normalizeDecimalInput(value)
    const valNumber = Number(Number(value).toFixed(2))
    value = fixPercentageValueIfOutOfBoundary(valNumber)

    setForm(prev => ({
        ...prev,
        discountPercentage: value,
        totalAmount: String(getTotalAmount(parseFloat(prev.amount) || 0, parseFloat(prev.vatPercentage) || 0, parseFloat(value) || 0)),
    }))
  }

  function handleAmountChange(value: string) {
    value = normalizeDecimalInput(value)
    setForm(prev => ({
        ...prev,
        amount: value,
        totalAmount: String(getTotalAmount(parseFloat(value) || 0, parseFloat(prev.vatPercentage) || 0, parseFloat(prev.discountPercentage) || 0)),
    }))
  }

  async function reload() {
    try {
      const q = await QuotationAPI.getAll();
      setQuotations(q);
    } catch {
      showToast("Errore nel caricamento dei preventivi", "error");
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return quotations
      .filter((p) => {
        if (
          q &&
          !p.number.toLowerCase().includes(q) &&
          !p.title.toLowerCase().includes(q) &&
          !p.customerName.toLowerCase().includes(q)
        )
          return false;
        if (statusFilter && p.quotationStatus !== Number(statusFilter))
          return false;
        if (customerFilter && p.customerId !== Number(customerFilter))
          return false;
        return true;
      })
      .sort((a, b) => b.number.localeCompare(a.number, undefined, { numeric: true }));
  }, [quotations, search, statusFilter, customerFilter]);

  function kpiFor(status: QuotationStatus) {
    const rows = quotations.filter((p) => p.quotationStatus === status);
    return {
      count: rows.length,
      sum: rows.reduce((s, p) => s + (p.amount ?? 0), 0),
    };
  }

  const kpiTotal = {
    count: quotations.length,
    sum: quotations.reduce((s, p) => s + (p.amount ?? 0), 0),
  };
  const kpiDraft = kpiFor(QuotationStatus.Draft);
  const kpiSent = kpiFor(QuotationStatus.Sent);
  const kpiAccepted = kpiFor(QuotationStatus.Accepted);
  const kpiRejected = kpiFor(QuotationStatus.Rejected);
  const kpiExpired = kpiFor(QuotationStatus.Expired);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleItemsChange(next: QuotationProductFormItem[]) {
    setFormItems(next);
    if (next.length === 0) return;
    const total = next.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    setField("amount", total.toFixed(2));
  }

  async function openNew() {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const expirationDays =
      parseInt(getSettingValue(settings, "ExpirationDays") ?? "30") || 30;
    const expDate = new Date(today);
    expDate.setDate(expDate.getDate() + expirationDays);
    const expStr = expDate.toISOString().slice(0, 10);

    const vatDefault = getSettingValue(settings, "VatPercentage") ?? "22";
    const descDefault = getSettingValue(settings, "QuotationNotes") ?? "";

    setEditingQuotation(null);
    setForm({
      ...emptyForm(),
      vatPercentage: vatDefault,
      discountPercentage: "0",
      issueDate: todayStr,
      validityDate: expStr,
      quotationStatus: String(QuotationStatus.Draft),
      description: descDefault,
    });
    setFormItems([]);
    setModalOpen(true);

    setNumberLoading(true);
    try {
      const num = await QuotationAPI.getNextNumber();
      setForm((prev) => ({ ...prev, number: num }));
    } catch {
      showToast(
        "Numero non generato automaticamente, inseriscilo a mano",
        "warning",
      );
    } finally {
      setNumberLoading(false);
    }
  }

  function openEdit(q: Quotation) {
    setEditingQuotation(q);
    setForm({
      number: q.number,
      customerId: String(q.customerId),
      title: q.title,
      description: q.description ?? "",
      amount: String(q.amount),
      vatPercentage: String(q.vatPercentage),
      discountPercentage: String(q.discountPercentage),
      issueDate: toDateInput(q.issueDate),
      validityDate: toDateInput(q.validityDate),
      quotationStatus: String(q.quotationStatus),
      notes: q.notes ?? "",
      totalAmount: String(getTotalAmount(q.amount, q.vatPercentage, q.discountPercentage)),
    });
    setFormItems(q.products.map((p) => ({
      productId: p.productId,
      quantity: p.quantity,
      productName: p.productName,
      productCode: p.productCode,
      unitPrice: p.unitPrice,
    })));
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingQuotation(null);
  }

  async function handleSave() {
    if (!form.number.trim()) {
      showToast("Numero preventivo obbligatorio", "warning");
      return;
    }
    if (!form.customerId) {
      showToast("Cliente obbligatorio", "warning");
      return;
    }
    if (!form.quotationStatus) {
      showToast("Stato obbligatorio", "warning");
      return;
    }
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount < 0) {
      showToast("Importo non valido", "warning");
      return;
    }

    const payload: QuotationRequest = {
      number: form.number.trim(),
      customerId: parseInt(form.customerId),
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      amount,
      vatPercentage: parseFloat(form.vatPercentage) || 0,
      discountPercentage: parseFloat(form.discountPercentage) || 0,
      issueDate: form.issueDate || undefined,
      validityDate: form.validityDate || undefined,
      quotationStatus: parseInt(form.quotationStatus) as QuotationStatus,
      notes: form.notes.trim() || undefined,
      products: formItems.map((i) => ({ productId: i.productId, quantity: i.quantity, productName: i.productName })),
    };

    setSaving(true);
    try {
      if (editingQuotation) {
        await QuotationAPI.update(editingQuotation.id, payload);
        showToast("Preventivo aggiornato", "success");
      } else {
        await QuotationAPI.create(payload);
        showToast("Preventivo creato", "success");
      }
      closeModal();
      await reload();
    } catch (e: unknown) {
      showToast(
        e instanceof Error ? `Errore: ${e.message}` : "Errore nel salvataggio",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkAccepted(q: Quotation) {
    try {
      await QuotationAPI.statusUpdate(q.id, QuotationStatus.Accepted);
      showToast("Preventivo segnato come accettato", "success");
      await reload();
    } catch (e: unknown) {
      showToast(
        e instanceof Error ? `Errore: ${e.message}` : "Errore",
        "error",
      );
    }
  }

  async function handleMarkRejected(q: Quotation) {
    try {
      await QuotationAPI.statusUpdate(q.id, QuotationStatus.Rejected);
      showToast("Preventivo segnato come rifiutato", "success");
      await reload();
    } catch (e: unknown) {
      showToast(
        e instanceof Error ? `Errore: ${e.message}` : "Errore",
        "error",
      );
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await QuotationAPI.delete(deleteTarget.id);
      showToast("Preventivo eliminato", "success");
      setDeleteTarget(null);
      await reload();
    } catch (e: unknown) {
      showToast(
        e instanceof Error ? `Errore: ${e.message}` : "Errore",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  }

  function exportCsv() {
    if (!filtered.length) {
      showToast("Nessun dato da esportare", "warning");
      return;
    }
    const header = [
      "N&#176;",
      "Titolo",
      "Cliente",
      "Importo",
      "IVA%",
      "Sconto%",
      "Data emissione",
      "Scadenza",
      "Stato",
    ];
    const rows = filtered.map((q) =>
      [
        q.number,
        q.title,
        q.customerName,
        q.amount,
        q.vatPercentage,
        q.discountPercentage,
        q.issueDate ? q.issueDate.slice(0, 10) : "",
        q.validityDate ? q.validityDate.slice(0, 10) : "",
        QUOTATION_STATUS_INFO[q.quotationStatus]?.text ?? "",
      ]
        .map((v) => `"${v ?? ""}"`)
        .join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `preventivi_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast("CSV esportato", "success");
  }

  const filteredTotal = filtered.reduce((s, p) => s + (p.amount ?? 0), 0);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  async function generatePdf(q: Quotation) {
    // @ts-ignore
    const html2pdf = (await import("html2pdf.js")).default;

    const descHtml = q.description ? await marked.parse(q.description) : "";
    const notesHtml = q.notes
      ? `<p style="font-size:11px;color:#6b7280;margin-top:8px">${q.notes}</p>`
      : "";

    const net = q.amount * (1 - (q.discountPercentage ?? 0) / 100);
    const vat = (net * (q.vatPercentage ?? 0)) / 100;
    const total = net + vat;

    const statusInfo = QUOTATION_STATUS_INFO[q.quotationStatus];

    const companyName = getSettingValue(settings, "CompanyName") || "";
    const companyAddress = getSettingValue(settings, "Address") || "";
    const companyVat = getSettingValue(settings, "VatNumber") || "";
    const companyEmail = getSettingValue(settings, "Email") || "";
    const companyPhone = getSettingValue(settings, "Phone") || "";
    const companyWebsite = getSettingValue(settings, "Website") || "";
    const companyLogo = getSettingValue(settings, "CompanyLogo") || "";

    const logoHtml = companyLogo
      ? `<img src="${companyLogo}" style="width:52px;height:52px;object-fit:contain;border-radius:10px;border:1px solid #e5e7eb;background:#fff" />`
      : `<div style="width:52px;height:52px;background:#2563eb;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:700">${(companyName || "P").charAt(0).toUpperCase()}</div>`;

    const footerParts = [
      companyName,
      companyAddress,
      companyVat ? `P.IVA ${companyVat}` : "",
      companyEmail,
      companyPhone,
      companyWebsite,
    ].filter(Boolean);

    const footerHtml = footerParts.length
      ? `<div style="margin-top:14mm;padding-top:4mm;border-top:1px solid #e5e7eb;text-align:center;font-size:10px;color:#9ca3af">
          ${footerParts.join(" &nbsp;&bull;&nbsp; ")}
        </div>`
      : "";

    const signaturesHtml = `
      <div style="margin-top:16mm">
        <div style="font-size:11px;color:#374151;margin-bottom:10mm">Data: __________________</div>
        <div style="display:flex;justify-content:space-between;gap:24px">
          <div style="width:45%;text-align:center">
            <div style="border-bottom:1px solid #9ca3af;height:14mm"></div>
            <div style="font-size:11px;color:#6b7280;margin-top:4px">${companyName ? `${companyName} — ` : ""}Firma per accettazione</div>
          </div>
          <div style="width:45%;text-align:center">
            <div style="border-bottom:1px solid #9ca3af;height:14mm"></div>
            <div style="font-size:11px;color:#6b7280;margin-top:4px">${q.customerName} — Firma per accettazione</div>
          </div>
        </div>
      </div>`;

    const html = `
      <div style="margin:5px 10px 10px;padding:10mm;font-family:Arial,sans-serif;color:#111827;background:#fff">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10mm">
          <div style="display:flex;gap:14px;align-items:center">
            ${logoHtml}
            <div>
              ${companyName ? `<div style="font-size:14px;font-weight:700;color:#111827">${companyName}</div>` : ""}
              <div style="font-size:11px;color:#6b7280">${[companyAddress, companyVat ? `P.IVA ${companyVat}` : ""].filter(Boolean).join(" · ")}</div>
              ${[companyEmail, companyPhone].filter(Boolean).length ? `<div style="font-size:11px;color:#6b7280">${[companyEmail, companyPhone].filter(Boolean).join(" · ")}</div>` : ""}
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:20px;font-weight:700;color:#111827">Preventivo ${q.number}</div>
            <div style="font-size:12px;color:#6b7280;margin-bottom:6px">${q.title || ""}</div>
            <span style="background:#dbeafe;color:#1e40af;padding:3px 12px;border-radius:99px;font-size:11px;font-weight:600">${statusInfo?.text ?? ""}</span>
          </div>
        </div>

        <div style="height:1px;background:#e5e7eb;margin:0 0 8mm"></div>

        <div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:8mm">
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;margin-bottom:4px">Cliente</div>
            <div style="font-size:15px;font-weight:600">${q.customerName}</div>
          </div>
          <div style="text-align:right;font-size:12px;color:#374151">
            <div><strong>Data emissione:</strong> ${formatDate(q.issueDate)}</div>
            <div><strong>Scadenza:</strong> ${formatDate(q.validityDate)}</div>
          </div>
        </div>

        ${
          q.products && q.products.length
            ? `<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:6mm">
                <tr style="background:#f9fafb">
                  <th style="padding:8px 12px;text-align:center;border:1px solid #e5e7eb;width:15%">Quantità</th>
                  <th style="padding:8px 12px;text-align:left;border:1px solid #e5e7eb">Prodotto / Servizio</th>
                  <th style="padding:8px 12px;text-align:right;border:1px solid #e5e7eb;width:25%">Prezzo</th>
                </tr>
                ${q.products
                  .map(
                    (p) => `<tr>
                      <td style="padding:8px 12px;border:1px solid #e5e7eb;text-align:center">${p.quantity}</td>
                      <td style="padding:8px 12px;border:1px solid #e5e7eb">${p.productName}</td>
                      <td style="padding:8px 12px;border:1px solid #e5e7eb;text-align:right">${formatCurrency(p.unitPrice * p.quantity)}</td>
                    </tr>`,
                  )
                  .join("")}
              </table>`
            : ""
        }

        <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8mm">
          <tr style="background:#f9fafb">
            <th style="padding:8px 12px;text-align:left;border:1px solid #e5e7eb">Imponibile</th>
            <th style="padding:8px 12px;text-align:left;border:1px solid #e5e7eb">IVA (${q.vatPercentage ?? 0}%)</th>
            <th style="padding:8px 12px;text-align:left;border:1px solid #e5e7eb">Sconto (${q.discountPercentage ?? 0}%)</th>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb">${formatCurrency(q.amount)}</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb">${formatCurrency(vat)}</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb">${q.discountPercentage ?? 0}%</td>
          </tr>
        </table>

        <div style="display:flex;justify-content:flex-end;margin-bottom:8mm">
          <div style="min-width:60mm;display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px">
            <span style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#374151">Totale complessivo</span>
            <span style="font-weight:700;font-size:15px">${formatCurrency(total)}</span>
          </div>
        </div>

        ${descHtml ? `<div style="height:1px;background:#e5e7eb;margin:0 0 6mm"></div><div style="font-size:12px;line-height:1.6">${descHtml}</div>` : ""}
        ${notesHtml}
        ${signaturesHtml}
        ${footerHtml}
      </div>`;

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    await html2pdf()
      .set({
        filename: `preventivo_${q.number}.pdf`,
        margin: 10,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { format: "a4", unit: "mm" },
      })
      .from(container)
      .save();

    container.remove();
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24,}}>
        <h1 className="page-title"> <i className="fa-solid fa-receipt" /> Preventivi</h1>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
          <i className="fa-solid fa-circle-plus" style={{ marginRight: 6 }} />
          Nuovo preventivo
        </button>
      </div>

      <div className="grid-3 mb-24">
        <div className="kpi-card">
          <div className="kpi-icon">
            <i className="fa-solid fa-receipt" />
          </div>
          <div className="kpi-label">Totale preventivi</div>
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
            <i className="fa-brands fa-firstdraft" />
          </div>
          <div className="kpi-label">Bozza</div>
          <div className="kpi-value">{kpiDraft.count}</div>
          <div className="kpi-delta">{formatCurrency(kpiDraft.sum)}</div>
        </div>
        <div className="kpi-card">
          <div
            className="kpi-icon"
            style={{
              background: "var(--color-info-bg)",
              color: "var(--color-info)",
            }}
          >
            <i className="fa-solid fa-spinner" />
          </div>
          <div className="kpi-label">Inviato</div>
          <div className="kpi-value">{kpiSent.count}</div>
          <div className="kpi-delta">{formatCurrency(kpiSent.sum)}</div>
        </div>
        <div className="kpi-card">
          <div
            className="kpi-icon"
            style={{
              background: "var(--color-success-bg)",
              color: "var(--color-success)",
            }}
          >
            <i className="fa-regular fa-circle-check" />
          </div>
          <div className="kpi-label">Accettato</div>
          <div className="kpi-value">{kpiAccepted.count}</div>
          <div className="kpi-delta">{formatCurrency(kpiAccepted.sum)}</div>
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
          <div className="kpi-label">Rifiutato</div>
          <div className="kpi-value">{kpiRejected.count}</div>
          <div className="kpi-delta">{formatCurrency(kpiRejected.sum)}</div>
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
          <div className="kpi-label">Scaduto</div>
          <div className="kpi-value">{kpiExpired.count}</div>
          <div className="kpi-delta">{formatCurrency(kpiExpired.sum)}</div>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search-bar" style={{ width: 260 }}>
            <span className="search-icon">
              <i className="fa-solid fa-magnifying-glass" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Cerca per numero, titolo, cliente…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-control"
            style={{ width: "auto" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tutti gli stati</option>
            {Object.entries(QUOTATION_STATUS_INFO).map(([id, info]) => (
              <option key={id} value={id}>
                {info.text}
              </option>
            ))}
          </select>
          <select
            className="form-control"
            style={{ width: "auto" }}
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
          >
            <option value="">Tutti i clienti</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {[
                  c.companyName ? `${c.companyName} -` : null,
                  c.name,
                  c.surname,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </option>
            ))}
          </select>
          <div className="toolbar-right">
            <button className="btn btn-ghost btn-sm" onClick={exportCsv}>
              <i className="fa-solid fa-download" /> Esporta
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center" style={{ padding: "48px 0" }}>
            <div className="spinner" />
          </div>
        ) : (
          <div
            className="table-wrapper"
            style={{ border: "none", borderRadius: 0 }}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th>N&#176; Preventivo</th>
                  <th>Titolo</th>
                  <th>Cliente</th>
                  <th>Importo</th>
                  <th>Data emissione</th>
                  <th>Scadenza</th>
                  <th>Stato</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 0 }}>
                      <EmptyState
                        message="Nessun preventivo trovato"
                        actionLabel="Nuovo preventivo"
                        onAction={openNew}
                      />
                    </td>
                  </tr>
                ) : (
                  paginated.map((q) => {
                    const statusInfo = QUOTATION_STATUS_INFO[q.quotationStatus];
                    return (
                      <tr key={q.id}>
                        <td className="font-medium"><code style={{ fontSize: 12 }}>{q.number}</code></td>
                        <td>{q.title}</td>
                        <td>{q.customerName}</td>
                        <td className="font-semibold">
                          {formatCurrency(q.amount)}
                        </td>
                        <td>{formatDate(q.issueDate)}</td>
                        <td>{formatDate(q.validityDate)}</td>
                        <td>
                          {statusInfo && (
                            <Badge cls={statusInfo.cls}>{statusInfo.text}</Badge>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="btn btn-ghost btn-sm btn-icon"
                              title="Modifica"
                              onClick={() => openEdit(q)}
                            >
                              <i className="fa-solid fa-pen" />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm btn-icon"
                              title="Segna accettato"
                              onClick={() => handleMarkAccepted(q)}
                              style={{ color: 'var(--color-success)' }}
                            >
                              <i className="fa-solid fa-calendar-check" />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm btn-icon"
                              title="Segna rifiutato"
                              onClick={() => handleMarkRejected(q)}
                              style={{ color: 'var(--color-danger)' }}
                            >
                              <i className="fa-solid fa-calendar-xmark" />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm btn-icon"
                              title="Genera PDF"
                              onClick={() => generatePdf(q)}
                              style={{ color: 'var(--color-primary)' }}
                            >
                              <i className="fa-solid fa-file-pdf" />
                            </button>
                            <button
                              className="btn btn-danger btn-sm btn-icon"
                              title="Elimina"
                              onClick={() => setDeleteTarget(q)}
                            >
                              <i className="fa-solid fa-trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
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
              {filtered.length} preventivi
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

        <div
          className="card-footer"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span className="text-muted text-sm">
            {filtered.length} preventivi
          </span>
          <span className="font-semibold">
            Totale: {formatCurrency(filteredTotal)}
          </span>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingQuotation ? "Modifica preventivo" : "Nuovo preventivo"}
        icon={editingQuotation ? "fa-solid fa-pen" : "fa-solid fa-receipt"}
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
              disabled={saving || numberLoading}
            >
              {saving ? (
                <span className="spinner" />
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk" /> Salva preventivo
                </>
              )}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Numero preventivo</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={numberLoading ? "Generazione…" : "2025-001"}
                  value={form.number}
                  readOnly={numberLoading}
                  disabled={true}
                  onChange={(e) => setField("number", e.target.value)}
                />
            </div>
            <div className="form-group">
              <label className="form-label">Cliente *</label>
              <select
                className="form-control"
                value={form.customerId}
                onChange={(e) => setField("customerId", e.target.value)}
              >
                <option value="">- Seleziona cliente -</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {[
                      c.companyName ? `${c.companyName} -` : null,
                      c.name,
                      c.surname,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Titolo</label>
            <input
              type="text"
              className="form-control"
              placeholder="Titolo preventivo"
              maxLength={50}
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descrizione</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Sviluppo sito web, consulenza…"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Prodotti associati</label>
            <QuotationProductsPicker
              items={formItems}
              onChange={handleItemsChange}
              availableProducts={products}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Importo (€) *</label>
              <input
                type="text"
                inputMode="decimal"
                className="form-control"
                placeholder="0.00"
                value={form.amount}
                disabled={formItems.length > 0}
                title={formItems.length > 0 ? "Calcolato automaticamente dai prodotti associati" : undefined}
                onChange={(e) => handleAmountChange(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">IVA (%)</label>
              <input
                type="text"
                inputMode="decimal"
                className="form-control"
                value={form.vatPercentage}
                onChange={(e) => handleVatPercentageChange(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sconto (%)</label>
              <input
                type="text"
                inputMode="decimal"
                className="form-control"
                value={form.discountPercentage}
                onChange={(e) => handleDiscountPercentageChange(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Importo Finale (€)</label>
              <input
                type="number"
                className="form-control"
                value={form.totalAmount}
                disabled={true}
                title={"Applicato lo sconto e l'iva"}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Data emissione</label>
              <input
                type="date"
                className="form-control"
                value={form.issueDate}
                onChange={(e) => setField("issueDate", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Scadenza</label>
              <input
                type="date"
                className="form-control"
                value={form.validityDate}
                onChange={(e) => setField("validityDate", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Stato *</label>
            <select
              className="form-control"
              value={form.quotationStatus}
              onChange={(e) => setField("quotationStatus", e.target.value)}
            >
              <option value="">- Seleziona stato -</option>
              {Object.entries(QUOTATION_STATUS_INFO).map(([id, info]) => (
                <option key={id} value={id}>
                  {info.text}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Note interne</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Note aggiuntive"
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={
          deleteTarget
            ? `Vuoi eliminare il preventivo "${deleteTarget.number} - ${deleteTarget.title}"?`
            : ""
        }
        loading={deleting}
      />
    </div>
  );
}
