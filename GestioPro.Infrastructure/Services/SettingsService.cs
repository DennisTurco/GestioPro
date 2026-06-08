using GestioPro.Infrastructure.Data;
using GestioPro.Common.DTOs;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GestioPro.Infrastructure.Services;

public class SettingsService(AppDbContext context) : ISettingsService
{
    // TODO: restituisci tutte le impostazioni mappate su SettingsResponseDTO
    public async Task<List<SettingsResponseDTO>> GetAllAsync()
    {
        throw new NotImplementedException();
    }

    // TODO: trova per Code (chiave primaria stringa), restituisci null se non trovato
    public async Task<SettingsResponseDTO?> GetByCodeAsync(string code)
    {
        throw new NotImplementedException();
    }

    // TODO: aggiorna Value e LastUpdateDate, salva
    public async Task<SettingsResponseDTO> UpdateAsync(string code, SettingsRequestDTO dto)
    {
        throw new NotImplementedException();
    }
}
