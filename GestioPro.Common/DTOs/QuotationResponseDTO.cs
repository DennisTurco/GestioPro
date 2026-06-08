namespace GestioPro.Common.DTOs;

public record QuotationResponseDTO(
    long Id,
    long CustomerId,
    string CustomerName,
    long QuotationStatusId,
    string QuotationStatusName,
    string Number,
    float Amount,
    int VatPercentage,
    int DiscountPercentage,
    string? Description,
    string? Notes,
    DateOnly CreationDate,
    DateOnly LastUpdateDate,
    DateOnly? IssueDate,
    DateOnly? ValidityDate
);
