using System.ComponentModel.DataAnnotations;
using GestioPro.Common.Enums;

namespace GestioPro.Common.DTOs;

public record ContractRequestDTO
(
    long QuotationId,
    ContractType ContractType,
    [Required] string Number,
    [MaxLength(200)] string Title,
    [Required, Range(0, float.MaxValue)] float Amount,
    [Required, Range(0, 100)] int VatPercentage,
    [MaxLength(2000)] string? Description,
    [MaxLength(1000)] string? Notes,
    string? FilePath,
    DateOnly StartDate
);
