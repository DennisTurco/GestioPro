namespace GestioPro.Common.DTOs;

/// <summary>
/// SMTP settings as shown to the admin: the password is never sent back
/// </summary>
public record SmtpSettingsResponseDTO(
    string? Host,
    int? Port,
    string Security,
    string? Username,
    bool HasPassword
);
