using System.ComponentModel.DataAnnotations;

namespace GestioPro.Common.DTOs;

public record ProductRequestDTO(
    long CategoryId,
    long StatusId,
    [Required] string Code,
    string? Ean,
    [Required, MaxLength(50)] string Name,
    [MaxLength(1000)] string? Description,
    [Range(0, int.MaxValue)] int? Quantity,
    [Required, Range(0, 100)] int VatPercentage,
    [Required, Range(0, float.MaxValue)] float Price
);
