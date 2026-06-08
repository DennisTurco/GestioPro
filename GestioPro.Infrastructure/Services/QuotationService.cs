using GestioPro.Infrastructure.Data;
using GestioPro.Common.DTOs;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GestioPro.Infrastructure.Services;

public class QuotationService(AppDbContext context) : IQuotationService
{
    // TODO: carica con Include() su Customer e QuotationStatus, mappa su DTO
    public async Task<List<QuotationResponseDTO>> GetAllAsync()
    {
        throw new NotImplementedException();
    }

    // TODO: trova per id con Include(), restituisci null se non trovato
    public async Task<QuotationResponseDTO?> GetByIdAsync(long id)
    {
        throw new NotImplementedException();
    }

    // TODO: imposta CreationDate e LastUpdateDate, verifica unicità Number, salva
    public async Task CreateAsync(QuotationRequestDTO dto)
    {
        throw new NotImplementedException();
    }

    // TODO: aggiorna tutti i campi, aggiorna LastUpdateDate, salva
    public async Task<QuotationResponseDTO> UpdateAsync(long id, QuotationRequestDTO dto)
    {
        throw new NotImplementedException();
    }

    // TODO: elimina per id
    public async Task DeleteAsync(long id)
    {
        throw new NotImplementedException();
    }
}
