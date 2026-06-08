using System.ComponentModel.DataAnnotations;

namespace GestioPro.Common.DTOs;

public record QuotationRequestDTO(
    long CustomerId,
    long QuotationStatusId,
    [Required] string Number,
    [Required, Range(0, float.MaxValue)] float Amount,
    [Required, Range(0, 100)] int VatPercentage,
    [Required, Range(0, 100)] int DiscountPercentage,
    [MaxLength(2000)] string? Description,
    [MaxLength(1000)] string? Notes,
    DateOnly? IssueDate,
    DateOnly? ValidityDate
);
