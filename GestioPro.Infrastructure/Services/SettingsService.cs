using GestioPro.Infrastructure.Data;
using GestioPro.Common.DTOs;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using GestioPro.Common.Helpers;
using Microsoft.EntityFrameworkCore;
using GestioPro.Common.Models;

namespace GestioPro.Infrastructure.Services;

public class SettingsService(AppDbContext context, IAuditService auditService) : ISettingsService
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
            .FirstOrDefaultAsync(s => s.Code == code) ?? throw new BusinessException("Impostazione non trovata");

        try
        {
            DataValidatorHelper.ThrowIfInvalidInformation(DataValidatorHelper.GetTypeByCode(code), dto.Value);
        }
        catch (NotImplementedException)
        {
            // it's not a setting to validate
        }

        var oldValues = MapToDto(setting);

        setting.Value = dto.Value;
        setting.LastUpdateDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        var newValues = MapToDto(setting);

        await auditService.LogAsync("Update", nameof(Settings), setting.Code, oldValues, newValues);

        return newValues;
    }

    private static SettingsResponseDTO MapToDto(Settings s)
        => new(
            s.Code,
            s.Value,
            s.Description,
            s.LastUpdateDate
        );
}
