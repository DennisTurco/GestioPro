using GestioPro.Common.DTOs;
using GestioPro.Common.Enums;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Helpers;
using GestioPro.Common.Interfaces;
using GestioPro.Common.Models;
using GestioPro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GestioPro.Infrastructure.Services;

public class QuotationService(AppDbContext context) : IQuotationService
{
    public async Task<List<QuotationResponseDTO>> GetAllAsync()
        => await context.Quotations
            .Include(q => q.Customer)
            .Include(q => q.Products).ThenInclude(p => p.Product)
            .AsNoTracking()
            .Where(q => !q.IsDisabled)
            .Select(x => MapToDto(x))
            .ToListAsync();

    public async Task<QuotationResponseDTO?> GetByIdAsync(long id)
    {
        var quotation = await context.Quotations
            .Include(q => q.Customer)
            .Include(q => q.Products).ThenInclude(p => p.Product)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        return quotation is null ? null : MapToDto(quotation);
    }

    private async Task ReplaceProductsAsync(long quotationId, List<QuotationProductRequestDTO> items)
    {
        var existing = await context.QuotationProducts
            .Where(qp => qp.QuotationId == quotationId)
            .ToListAsync();
        context.QuotationProducts.RemoveRange(existing);

        if (items.Count == 0) return;

        var productIds = items.Select(i => i.ProductId).ToList();
        var products = await context.Products
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id);

        foreach (var item in items)
        {
            if (!products.TryGetValue(item.ProductId, out var product))
                throw new BusinessException($"Prodotto con id {item.ProductId} non trovato");

            await context.QuotationProducts.AddAsync(new QuotationProduct
            {
                QuotationId = quotationId,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = product.Price,
            });
        }
    }

    public async Task<QuotationResponseDTO> CreateAsync(QuotationRequestDTO dto)
    {
        var existing = await context.Quotations
            .FirstOrDefaultAsync(x => x.Number.Equals(dto.Number));

        if (existing is not null)
            throw new BusinessException("Esiste già un preventivo con lo stesso numero");

        DateTimeOffset now = DateTimeOffset.UtcNow;
        var quotation = new Quotation
        {
            CustomerId = dto.CustomerId,
            QuotationStatus = dto.QuotationStatus,
            Number = dto.Number,
            Title = dto.Title,
            Amount = dto.Amount,
            VatPercentage = dto.VatPercentage,
            DiscountPercentage = dto.DiscountPercentage,
            Description = dto.Description,
            Notes = dto.Notes,
            CreationDate = now,
            LastUpdateDate = now,
            IssueDate = dto.IssueDate,
            ValidityDate = dto.ValidityDate,
        };

        await context.AddAsync(quotation);
        await context.SaveChangesAsync();

        await ReplaceProductsAsync(quotation.Id, dto.Products);
        await context.SaveChangesAsync();

        return (await GetByIdAsync(quotation.Id))!;
    }

    public async Task<QuotationResponseDTO> UpdateAsync(long id, QuotationRequestDTO dto)
    {
        var quotation = await context.Quotations
            .Include(q => q.Customer)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (quotation is null)
            throw new BusinessException("Preventivo non trovato");

        quotation.CustomerId = dto.CustomerId;
        quotation.QuotationStatus = dto.QuotationStatus;
        quotation.Number = dto.Number;
        quotation.Title = dto.Title;
        quotation.Amount = dto.Amount;
        quotation.VatPercentage = dto.VatPercentage;
        quotation.DiscountPercentage = dto.DiscountPercentage;
        quotation.Description = dto.Description;
        quotation.Notes = dto.Notes;
        quotation.LastUpdateDate = DateTimeOffset.UtcNow;
        quotation.IssueDate = dto.IssueDate;
        quotation.ValidityDate = dto.ValidityDate;

        await ReplaceProductsAsync(quotation.Id, dto.Products);
        await context.SaveChangesAsync();

        return (await GetByIdAsync(id))!;
    }

    public async Task<QuotationResponseDTO> UpdateStatusAsync(long id, QuotationStatus status)
    {
        var quotation = await context.Quotations
            .Include(q => q.Customer)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (quotation is null)
            throw new BusinessException("Preventivo non trovato");

        quotation.QuotationStatus = status;
        quotation.LastUpdateDate = DateTimeOffset.UtcNow;

        await context.SaveChangesAsync();
        return (await GetByIdAsync(id))!;
    }

    public async Task DisableAsync(long id)
    {
        var quotation = await context.Quotations
            .FirstOrDefaultAsync(x => x.Id == id);

        if (quotation is null)
            throw new BusinessException("Preventivo non trovato");

        quotation.IsDisabled = true;
        await context.SaveChangesAsync();
    }

    public async Task<string> CalculateNextNumberAsync()
    {
        var lastQuotation = await context.Quotations
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync();

        var year = DateTime.Today.Year;

        if (lastQuotation == null)
            return $"{year}-001";

        var quotationNumber = lastQuotation.Number.Split('-');
        if (int.Parse(quotationNumber[0]) != year)
            return $"{year}-001";
        
        return $"{year}-{quotationNumber[1].GetNext()}";
    }

    private static QuotationResponseDTO MapToDto(Quotation q)
        => new(
            q.Id,
            q.CustomerId,
            q.Customer.Name,
            q.QuotationStatus,
            q.Number,
            q.Title,
            q.Amount,
            q.VatPercentage,
            q.DiscountPercentage,
            q.Description,
            q.Notes,
            q.CreationDate,
            q.LastUpdateDate,
            q.IssueDate,
            q.ValidityDate,
            q.IsDisabled,
            q.Products.Select(p => new QuotationProductResponseDTO(
                p.ProductId,
                p.Product.Name,
                p.Product.Code,
                p.Quantity,
                p.UnitPrice,
                p.UnitPrice * p.Quantity
            )).ToList()
        );
}
