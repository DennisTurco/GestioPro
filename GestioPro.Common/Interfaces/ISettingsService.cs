using GestioPro.Common.DTOs;

namespace GestioPro.Common.Interfaces;

public interface ISettingsService
{
    Task<List<SettingsResponseDTO>> GetAllAsync();
    Task<SettingsResponseDTO?> GetByCodeAsync(string code);
    Task<SettingsResponseDTO> UpdateAsync(string code, SettingsRequestDTO dto);
}
