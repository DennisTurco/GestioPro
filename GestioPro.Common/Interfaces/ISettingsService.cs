using GestioPro.Common.DTOs;
using GestioPro.Common;

namespace GestioPro.Common.Interfaces;

public interface ISettingsService
{
    Task<List<SettingsResponseDTO>> GetAllAsync();
    Task<SettingsResponseDTO?> GetByCodeAsync(string code);
    Task<SettingsResponseDTO> UpdateAsync(string code, SettingsRequestDTO dto);
    Task<SmtpSettingsResponseDTO> GetSmtpAsync();
    Task<SmtpSettingsResponseDTO> UpdateSmtpAsync(SmtpSettingsRequestDTO dto);
    /// <summary>Saved SMTP server including the password, for sending only: null if not configured</summary>
    Task<SmtpConfiguration?> GetSmtpConfigurationAsync();
    /// <summary>Validates unsaved SMTP settings, filling a missing password with the saved one</summary>
    Task<SmtpConfiguration> ResolveSmtpConfigurationAsync(SmtpSettingsRequestDTO dto);
}
