namespace GestioPro.Common.DTOs;

/// <param name="Password">null keeps the saved password, "" removes it</param>
public record SmtpSettingsRequestDTO(
    string? Host,
    int? Port,
    string? Security,
    string? Username,
    string? Password
);
