using GestioPro.Infrastructure.Data;
using GestioPro.Common.DTOs;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using GestioPro.Common.Models;

namespace GestioPro.Infrastructure.Services;

public class SettingsService(AppDbContext context) : ISettingsService
{
    public async Task<List<SettingsResponseDTO>> GetAllAsync()
        => await context.Settings
            .AsNoTracking()
            .Select(s => MapToDto(s))
            .ToListAsync();

    public async Task<SettingsResponseDTO?> GetByCodeAsync(string code)
    {
        var setting = await context.Settings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Code.Equals(code));

        return setting is null ? null : MapToDto(setting);
    }

    public async Task<SettingsResponseDTO> UpdateAsync(string code, SettingsRequestDTO dto)
    {
        var setting = await context.Settings
            .FirstOrDefaultAsync(s => s.Code == code);

        if (setting is null)
            throw new BusinessException("Impostazione non trovata");

        setting.Value = dto.Value;
        setting.LastUpdateDate = DateTime.Now;

        await context.SaveChangesAsync();

        return MapToDto(setting);
    }

    private static SettingsResponseDTO MapToDto(Settings s)
        => new(
            s.Code,
            s.Value,
            s.Description,
            s.LastUpdateDate
        );
}
