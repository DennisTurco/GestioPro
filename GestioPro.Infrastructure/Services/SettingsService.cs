using GestioPro.Infrastructure.Data;
using GestioPro.Common.DTOs;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using GestioPro.Common.Helpers;
using Microsoft.EntityFrameworkCore;
using GestioPro.Common.Models;
using GestioPro.Infrastructure.Extensions;
using GestioPro.Common;
using StringKit;

namespace GestioPro.Infrastructure.Services;

public class SettingsService(AppDbContext context, IAuditService auditService) : ISettingsService
{
    // SMTP settings hold a password: they're kept out of the generic endpoints
    // (readable by every user) and only go through the admin-only SMTP ones
    private const string SmtpPrefix = "Smtp";
    private const string SmtpHost = "SmtpHost";
    private const string SmtpPort = "SmtpPort";
    private const string SmtpSecurity = "SmtpSecurity";
    private const string SmtpUsername = "SmtpUsername";
    private const string SmtpPassword = "SmtpPassword";
    private static readonly string[] SmtpCodes = [SmtpHost, SmtpPort, SmtpSecurity, SmtpUsername, SmtpPassword];
    // MailKit SecureSocketOptions names
    private static readonly string[] SmtpSecurityOptions = ["None", "Auto", "StartTls", "SslOnConnect"];

    public async Task<List<SettingsResponseDTO>> GetAllAsync()
        => await context.Settings
            .AsNoTracking()
            .Where(s => !s.Code.StartsWith(SmtpPrefix))
            .Select(s => MapToDto(s))
            .ToListAsync();

    public async Task<SettingsResponseDTO?> GetByCodeAsync(string code)
    {
        if (code.StartsWith(SmtpPrefix)) return null;

        var setting = await context.Settings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Code.Equals(code));

        return setting is null ? null : MapToDto(setting);
    }

    public async Task<SettingsResponseDTO> UpdateAsync(string code, SettingsRequestDTO dto)
    {
        if (code.StartsWith(SmtpPrefix))
            throw new EntityNotFoundException("Impostazione non trovata");

        var setting = await context.Settings
            .FirstOrDefaultAsync(s => s.Code == code) ?? throw new EntityNotFoundException("Impostazione non trovata");

        if (DataValidatorHelper.TryGetTypeByCode(code, out var type))
            DataValidatorHelper.ThrowIfInvalidInformation(type, dto.Value);

        var oldValues = MapToDto(setting);

        if (oldValues.HasChanged(setting, MapToDto)) return oldValues;

        setting.Value = dto.Value;
        setting.LastUpdateDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        var newValues = MapToDto(setting);

        await auditService.LogAsync("Update", nameof(Settings), setting.Code, oldValues, newValues);

        return newValues;
    }

    public async Task<SmtpSettingsResponseDTO> GetSmtpAsync()
        => MapToSmtpDto(await GetSmtpValuesAsync());

    public async Task<SmtpSettingsResponseDTO> UpdateSmtpAsync(SmtpSettingsRequestDTO dto)
    {
        var config = await ResolveSmtpConfigurationAsync(dto, requireHost: false);

        var settings = await context.Settings
            .Where(s => SmtpCodes.Contains(s.Code))
            .ToDictionaryAsync(s => s.Code);
        var oldValues = MapToSmtpDto(settings.ToDictionary(x => x.Key, x => x.Value.Value));

        var newValues = new Dictionary<string, string?>
        {
            [SmtpHost] = NullIfEmpty(config.Host),
            [SmtpPort] = config.Host.IsNullOrWhiteSpace() ? null : config.Port.ToString(),
            [SmtpSecurity] = config.Security,
            [SmtpUsername] = NullIfEmpty(config.Username),
            [SmtpPassword] = NullIfEmpty(config.Password),
        };

        foreach (var (code, value) in newValues)
        {
            if (!settings.TryGetValue(code, out var setting))
            {
                setting = new Settings { Code = code, Description = "SMTP server for outgoing emails" };
                await context.Settings.AddAsync(setting);
            }
            if (setting.Value == value) continue;
            setting.Value = value;
            setting.LastUpdateDate = DateTimeOffset.UtcNow;
        }

        await context.SaveChangesAsync();

        var result = MapToSmtpDto(newValues);
        // the DTOs never contain the password, only whether there is one
        await auditService.LogAsync("Update", nameof(Settings), "Smtp", oldValues, result);

        return result;
    }

    public async Task<SmtpConfiguration?> GetSmtpConfigurationAsync()
    {
        var values = await GetSmtpValuesAsync();
        var host = values.GetValueOrDefault(SmtpHost);
        if (string.IsNullOrWhiteSpace(host)) return null;

        return new SmtpConfiguration(
            host!,
            int.TryParse(values.GetValueOrDefault(SmtpPort), out var port) ? port : 587,
            values.GetValueOrDefault(SmtpSecurity) ?? "Auto",
            values.GetValueOrDefault(SmtpUsername),
            values.GetValueOrDefault(SmtpPassword));
    }

    public Task<SmtpConfiguration> ResolveSmtpConfigurationAsync(SmtpSettingsRequestDTO dto)
        => ResolveSmtpConfigurationAsync(dto, requireHost: true);

    private async Task<SmtpConfiguration> ResolveSmtpConfigurationAsync(SmtpSettingsRequestDTO dto, bool requireHost)
    {
        var host = dto.Host?.Trim() ?? "";
        var security = string.IsNullOrWhiteSpace(dto.Security) ? "Auto" : dto.Security!;

        if (host.IsNullOrWhiteSpace())
        {
            if (requireHost)
                throw new ValidationException("Inserisci l'indirizzo del server SMTP");
            // no host: email sending is turned off
            return new SmtpConfiguration("", 0, security, null, null);
        }
        if (dto.Port is null or < 1 or > 65535)
            throw new ValidationException("La porta SMTP deve essere un numero tra 1 e 65535");
        if (!SmtpSecurityOptions.Contains(security))
            throw new ValidationException("Tipo di sicurezza SMTP non valido");

        var password = dto.Password ?? (await GetSmtpValuesAsync()).GetValueOrDefault(SmtpPassword);

        return new SmtpConfiguration(host, dto.Port.Value, security, dto.Username?.Trim(), password);
    }

    private async Task<Dictionary<string, string?>> GetSmtpValuesAsync()
        => await context.Settings
            .AsNoTracking()
            .Where(s => SmtpCodes.Contains(s.Code))
            .ToDictionaryAsync(s => s.Code, s => s.Value);

    private static SmtpSettingsResponseDTO MapToSmtpDto(Dictionary<string, string?> values)
        => new(
            values.GetValueOrDefault(SmtpHost),
            int.TryParse(values.GetValueOrDefault(SmtpPort), out var port) ? port : null,
            values.GetValueOrDefault(SmtpSecurity) ?? "Auto",
            values.GetValueOrDefault(SmtpUsername),
            !string.IsNullOrWhiteSpace(values.GetValueOrDefault(SmtpPassword))
        );

    private static string? NullIfEmpty(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value;

    private static SettingsResponseDTO MapToDto(Settings s)
        => new(
            s.Code,
            s.Value,
            s.Description,
            s.LastUpdateDate
        );
}
