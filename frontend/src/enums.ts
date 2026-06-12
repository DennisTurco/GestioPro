// MUST MATCH WITH CustomerType Enum
const CustomerType = {
    Company:     1,
    PublicAdmin: 2,
    Freelancer:  3,
    Private:     4,
};

// MUST MATCH WITH QuotationStatus Enum
const QuotationStatus = {
    Draft:    1,
    Sent:     2,
    Accepted: 3,
    Rejected: 4,
    Expired:  5,
};

const CustomerTypeLabel = {
    [CustomerType.Company]:     "Azienda",
    [CustomerType.PublicAdmin]: "Pubblica Amministrazione",
    [CustomerType.Freelancer]:  "Freelancer",
    [CustomerType.Private]:     "Privato",
};

const QuotationStatusInfo = {
    [QuotationStatus.Draft]:    { text: "Bozza",     cls: "badge-muted"    },
    [QuotationStatus.Sent]:     { text: "Inviato",   cls: "badge-warning"  },
    [QuotationStatus.Accepted]: { text: "Accettato", cls: "badge-success"  },
    [QuotationStatus.Rejected]: { text: "Rifiutato", cls: "badge-danger"   },
    [QuotationStatus.Expired]:  { text: "Scaduto",   cls: "badge-neutral"  },
};
