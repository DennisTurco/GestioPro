using GestioPro.Common.Enums;

namespace GestioPro.Common.DTOs;

public record QuotationResponseDTO(
    long Id,
    long CustomerId,
    string CustomerName,
    QuotationStatus QuotationStatus,
    string Number,
    string Title,
    float Amount,
    int VatPercentage,
    int DiscountPercentage,
    string? Description,
    string? Notes,
    DateTimeOffset CreationDate,
    DateTimeOffset LastUpdateDate,
    DateOnly? IssueDate,
    DateOnly? ValidityDate,
    bool IsDisabled
);
