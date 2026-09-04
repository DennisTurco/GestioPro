using System.ComponentModel.DataAnnotations;

namespace GestioPro.Common.DTOs;

public record QuotationProductRequestDTO(
    long ProductId,
    [Range(1, int.MaxValue)] int Quantity,
    string? ProductName = null,
    [Range(0, float.MaxValue)] float? UnitPrice = null
);
