using GestioPro.Infrastructure.Data;
using GestioPro.Common.DTOs;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GestioPro.Infrastructure.Services;

public class ProductCategoryService(AppDbContext context) : IProductCategoryService
{
    // TODO: restituisci tutte le categorie mappate su ProductCategoryResponseDTO
    public async Task<List<ProductCategoryResponseDTO>> GetAllAsync()
    {
        throw new NotImplementedException();
    }

    // TODO: trova per id, restituisci null se non trovato
    public async Task<ProductCategoryResponseDTO?> GetByIdAsync(long id)
    {
        throw new NotImplementedException();
    }

    // TODO: crea nuova categoria dal dto
    public async Task CreateAsync(ProductCategoryRequestDTO dto)
    {
        throw new NotImplementedException();
    }

    // TODO: aggiorna nome, salva, ritorna DTO
    public async Task<ProductCategoryResponseDTO> UpdateAsync(long id, ProductCategoryRequestDTO dto)
    {
        throw new NotImplementedException();
    }

    // TODO: elimina per id
    public async Task DeleteAsync(long id)
    {
        throw new NotImplementedException();
    }
}
