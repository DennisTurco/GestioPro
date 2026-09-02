using GestioPro.Infrastructure.Data;
using GestioPro.Common.DTOs;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using GestioPro.Common.Models;

namespace GestioPro.Infrastructure.Services;

public class ProductService(AppDbContext context, IAuditService auditService) : IProductService
{
    public async Task<List<ProductResponseDTO>> GetAllAsync()
        => await context.Products
            .Include(x => x.Category)
            .AsNoTracking()
            .Where(x => !x.IsDisabled)
            .Select(x => MapToDto(x))
            .ToListAsync();

    public async Task<ProductResponseDTO?> GetByIdAsync(long id)
    {
        var product = await context.Products
            .Include(p => p.Category)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        return product is null ? null : MapToDto(product);
    }

    public async Task<ProductResponseDTO> CreateAsync(ProductRequestDTO dto)
    {
        var exists = await context.Products
            .AnyAsync(x => x.Code.Equals(dto.Code));

        if (exists)
            throw new BusinessException("Esiste già un prodotto con lo stesso codice");

        var category = await context.ProductCategories.FindAsync(dto.CategoryId)
            ?? throw new BusinessException("Categoria non trovata");

        var product = new Product
        {
            CategoryId = dto.CategoryId,
            Category = category,
            ProductStatus = dto.ProductStatus,
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

        var created = MapToDto(product);

        await auditService.LogAsync("Create", nameof(Product), product.Id.ToString(), newValues: created);

        return created;
    }

    public async Task<ProductResponseDTO> UpdateAsync(long id, ProductRequestDTO dto)
    {
        var entity = await context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(x => x.Id == id) ?? throw new BusinessException("Prodotto non trovato");

        var oldValues = MapToDto(entity);

        entity.ProductStatus = dto.ProductStatus;
        entity.Code = dto.Code;
        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.Price = dto.Price;
        entity.VatPercentage = dto.VatPercentage;
        entity.Ean = dto.Ean;
        entity.Quantity = dto.Quantity;
        entity.CategoryId = dto.CategoryId;

        await context.SaveChangesAsync();
        var newValues = MapToDto(entity);

        await auditService.LogAsync("Update", nameof(Product), entity.Id.ToString(), oldValues, newValues);

        return newValues;
    }

    public async Task DeleteAsync(long id)
    {
        var entity = await context.Products
           .Include(p => p.Category)
           .FirstOrDefaultAsync(x => x.Id == id) ?? throw new BusinessException("Prodotto non trovato");

        var oldValues = MapToDto(entity);

        entity.IsDisabled = true;

        await context.SaveChangesAsync();

        await auditService.LogAsync("Delete", nameof(Product), entity.Id.ToString(), oldValues);
    }

    private static ProductResponseDTO MapToDto(Product p)
     => new(
            p.Id,
            p.CategoryId,
            p.Category.Name,
            p.ProductStatus,
            p.Code,
            p.Ean,
            p.Name,
            p.Description,
            p.Quantity,
            p.VatPercentage,
            p.Price,
            p.IsDisabled
        );
}
