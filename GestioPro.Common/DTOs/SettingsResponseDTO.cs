namespace GestioPro.Common.DTOs;

public record SettingsResponseDTO(
    string Code,
    string? Value,
    string? Description,
    DateOnly? LastUpdateDate
);
