namespace GestioPro.Common.DTOs;

public record ProductResponseDTO(
    long Id,
    long CategoryId,
    string CategoryName,
    long StatusId,
    string StatusName,
    string Code,
    string? Ean,
    string Name,
    string? Description,
    int? Quantity,
    int VatPercentage,
    float Price
);
