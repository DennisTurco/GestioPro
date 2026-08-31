namespace GestioPro.Common.DTOs;

public record QuotationProductResponseDTO(
    long ProductId,
    string ProductName,
    string ProductCode,
    int Quantity,
    float UnitPrice,
    float LineTotal
);
