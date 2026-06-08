using System.ComponentModel.DataAnnotations;

namespace GestioPro.Common.DTOs;

public record SettingsRequestDTO(
    [MaxLength(100)] string? Value
);
