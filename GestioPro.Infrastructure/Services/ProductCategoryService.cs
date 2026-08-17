using GestioPro.Infrastructure.Data;
using GestioPro.Common.DTOs;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using GestioPro.Common.Models;

namespace GestioPro.Infrastructure.Services;

public class ProductCategoryService(AppDbContext context) : IProductCategoryService
{
    public async Task<List<ProductCategoryResponseDTO>> GetAllAsync()
    {
        return await context.ProductCategories
            .AsNoTracking()
            .Where(c => !c.IsDisabled)
            .Select(c => MapToDto(c))
            .ToListAsync();
    }

    public async Task<ProductCategoryResponseDTO?> GetByIdAsync(long id)
    {
        var entity = await context.ProductCategories
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        return entity is null ? null : MapToDto(entity);
    }

    public async Task<ProductCategoryResponseDTO> CreateAsync(ProductCategoryRequestDTO dto)
    {
        var existing = await context.ProductCategories
            .AnyAsync(x => x.Name.Trim().ToLower().Equals(dto.Name.Trim().ToLower()));

        if (existing)
            throw new BusinessException("Esiste già una categoria prodotto con lo stesso nome");

        DateTimeOffset now = DateTimeOffset.UtcNow;
        var entity = new ProductCategory
        {
            Name = dto.Name,
            Description = dto.Description,
            CreationDate = now,
            LastUpdateDate = now,
        };

        await context.AddAsync(entity);
        await context.SaveChangesAsync();
        return MapToDto(entity);
    }

    public async Task<ProductCategoryResponseDTO> UpdateAsync(long id, ProductCategoryRequestDTO dto)
    {
        var existing = await context.ProductCategories
            .FirstOrDefaultAsync(x => x.Id == id);

        if (existing is null)
            throw new BusinessException("Categoria prodotto non trovata");

        existing.Name = dto.Name;
        existing.Description = dto.Description;
        existing.LastUpdateDate = DateTimeOffset.UtcNow;

        await context.SaveChangesAsync();
        return MapToDto(existing);
    }

    public async Task DeleteAsync(long id)
    {
        var entity = await context.ProductCategories
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            throw new BusinessException("Categoria prodotto non trovata");

        entity.IsDisabled = true;
        entity.LastUpdateDate = DateTimeOffset.UtcNow;
        await context.SaveChangesAsync();
    }

    private static ProductCategoryResponseDTO MapToDto(ProductCategory p)
        => new(
            p.Id,
            p.Name,
            p.Description,
            p.CreationDate,
            p.LastUpdateDate,
            p.IsDisabled
        );
}
