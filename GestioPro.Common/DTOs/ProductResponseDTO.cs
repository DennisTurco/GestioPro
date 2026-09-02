using GestioPro.Common.Enums;

namespace GestioPro.Common.DTOs;

public record ProductResponseDTO(
    long Id,
    long CategoryId,
    string CategoryName,
    ProductStatus ProductStatus,
    ItemType ItemType,
    string Code,
    string? Ean,
    string Name,
    string? Description,
    int? Quantity,
    int VatPercentage,
    float Price,
    bool IsDisabled
);
