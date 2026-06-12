namespace GestioPro.Common.DTOs;

public record ProductCategoryResponseDTO(
    long Id,
    string Name,
    string? Description,
    DateTimeOffset CreationDate,
    DateTimeOffset LastUpdateDate
);
