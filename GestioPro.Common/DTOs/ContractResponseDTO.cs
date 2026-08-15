using GestioPro.Common.Enums;

namespace GestioPro.Common.DTOs;

public record ContractResponseDTO
(
    long Id,
    long QuotationId,
    ContractType ContractType,
    string Number,
    string Title,
    float Amount,
    int VatPercentage,
    string? Description,
    string? Notes,
    DateOnly StartDate,
    DateOnly EndDate,
    string? FilePath,
    DateTimeOffset CreationDate,
    DateTimeOffset LastUpdateDate,
    string Status
);
