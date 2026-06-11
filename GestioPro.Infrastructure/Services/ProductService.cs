using GestioPro.Infrastructure.Data;
using GestioPro.Common.DTOs;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using GestioPro.Common.Models;

namespace GestioPro.Infrastructure.Services;

public class ProductService(AppDbContext context) : IProductService
{
    public async Task<List<ProductResponseDTO>> GetAllAsync()
        => await context.Products
            .Include(x => x.Category)
            .Include(x => x.Status)
            .AsNoTracking()
            .Select(x => MapToDto(x))
            .ToListAsync(); 

    public async Task<ProductResponseDTO?> GetByIdAsync(long id)
    {
        var product = await context.Products
            .Include(p => p.Category)
            .Include(p => p.Status)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        return product is null ? null : MapToDto(product);
    }

    public async Task CreateAsync(ProductRequestDTO dto)
    {
        var exists = await context.Products
            .AnyAsync(x => x.Code.Equals(dto.Code));

        if (exists)
            throw new BusinessException("Esiste già un prodotto con lo stesso codice");

        var product = new Product
        {
            CategoryId = dto.CategoryId,
            StatusId = dto.StatusId,
            Code = dto.Code,
            Ean = dto.Ean,
            Name = dto.Name,
            Description = dto.Description,
            Quantity = dto.Quantity,
            VatPercentage = dto.VatPercentage,
            Price = dto.Price
        };

        await context.AddAsync(product);
        await context.SaveChangesAsync();
    }

    public async Task<ProductResponseDTO> UpdateAsync(long id, ProductRequestDTO dto)
    {
        var entity = await context.Products
            .Include(p => p.Category)
            .Include(p => p.Status)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity == null)
            throw new BusinessException("Prodotto non trovato");

        entity.Code = dto.Code;
        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.Price = dto.Price;
        entity.VatPercentage = dto.VatPercentage;

        await context.SaveChangesAsync();
        return MapToDto(entity);
    }

    public async Task DeleteAsync(long id)
    {
        var entity = await context.Products
           .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            throw new BusinessException("Prodotto non trovato");

        context.Products.Remove(entity);
        await context.SaveChangesAsync();
    }

    private static ProductResponseDTO MapToDto(Product p)
     => new (
            p.Id,
            p.CategoryId,
            p.Category.Name,
            p.StatusId,
            p.Status.Name.ToString(),
            p.Code,
            p.Ean,
            p.Name,
            p.Description,
            p.Quantity,
            p.VatPercentage,
            p.Price
        );
}
