using GestioPro.Infrastructure.Data;
using GestioPro.Common.DTOs;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GestioPro.Infrastructure.Services;

public class ProductService(AppDbContext context) : IProductService
{
    // TODO: usa LINQ con Include() per caricare Category e Status, poi mappa su DTO
    public async Task<List<ProductResponseDTO>> GetAllAsync()
    {
        throw new NotImplementedException();
    }

    // TODO: trova per id con Include(), restituisci null se non trovato
    public async Task<ProductResponseDTO?> GetByIdAsync(long id)
    {
        throw new NotImplementedException();
    }

    // TODO: controlla unicità di Code, poi salva
    public async Task CreateAsync(ProductRequestDTO dto)
    {
        throw new NotImplementedException();
    }

    // TODO: trova l'esistente, aggiorna tutti i campi, salva e ritorna il DTO
    public async Task<ProductResponseDTO> UpdateAsync(long id, ProductRequestDTO dto)
    {
        throw new NotImplementedException();
    }

    // TODO: elimina per id
    public async Task DeleteAsync(long id)
    {
        throw new NotImplementedException();
    }
}
