using GestioPro.Infrastructure.Data;
using GestioPro.Common.DTOs;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using GestioPro.Common.Models;

namespace GestioPro.Infrastructure.Services;

public class QuotationService(AppDbContext context) : IQuotationService
{
    public async Task<List<QuotationResponseDTO>> GetAllAsync()
        => await context.Quotations
            .Include(q => q.Customer)
            .AsNoTracking()
            .Select(x => MapToDto(x))
            .ToListAsync();

    public async Task<QuotationResponseDTO?> GetByIdAsync(long id)
    {
        var quotation = await context.Quotations
            .Include(q => q.Customer)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        return quotation is null ? null : MapToDto(quotation);
    }

    public async Task CreateAsync(QuotationRequestDTO dto)
    {
        var existing = await context.Quotations
            .FirstOrDefaultAsync(x => x.Number.Equals(x.Number));

        if (existing is not null)
            throw new BusinessException("Esiste già un preventivo con lo stesso numero");

        DateTimeOffset now = DateTimeOffset.Now;
        var quotation = new Quotation
        {
            CustomerId = dto.CustomerId,
            QuotationStatus = dto.QuotationStatus,
            Number = dto.Number,
            Amount = dto.Amount,
            VatPercentage = dto.VatPercentage,
            DiscountPercentage = dto.DiscountPercentage,
            Description = dto.Description,
            Notes = dto.Notes,
            CreationDate = now,
            LastUpdateDate = now,
            IssueDate = dto.IssueDate,
            ValidityDate = dto.ValidityDate
        };

        await context.AddAsync(quotation);
        await context.SaveChangesAsync();
    }

    public async Task<QuotationResponseDTO> UpdateAsync(long id, QuotationRequestDTO dto)
    {
        var quotation = await context.Quotations
            .Include(q => q.Customer)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (quotation is null)
            throw new BusinessException("Preventivo non trovato");

        var quotationNumberExists = await context.Quotations
            .Include(q => q.Customer)
            .AnyAsync(x => x.Number.Equals(dto.Number));

        if (quotationNumberExists)
            throw new BusinessException("Esiste già un preventivo con lo stesso numero");

        quotation.CustomerId = dto.CustomerId;
        quotation.QuotationStatus = dto.QuotationStatus;
        quotation.Number = dto.Number;
        quotation.Amount = dto.Amount;
        quotation.VatPercentage = dto.VatPercentage;
        quotation.DiscountPercentage = dto.DiscountPercentage;
        quotation.Description = dto.Description;
        quotation.Notes = dto.Notes;
        quotation.LastUpdateDate = DateTimeOffset.Now;
        quotation.IssueDate = dto.IssueDate;
        quotation.ValidityDate = dto.ValidityDate;

        await context.SaveChangesAsync();
        return MapToDto(quotation);
    }

    public async Task DeleteAsync(long id)
    {
        var quotation = await context.Quotations
            .FirstOrDefaultAsync(x => x.Id == id);

        if (quotation is null)
            throw new BusinessException("Preventivo non trovato");

        context.Remove(quotation);
        await context.SaveChangesAsync();
    }

    private static QuotationResponseDTO MapToDto(Quotation q)
        => new(
            q.Id,
            q.CustomerId,
            q.Customer.Name.ToString(),
            q.QuotationStatus,
            q.Number,
            q.Amount,
            q.VatPercentage,
            q.DiscountPercentage,
            q.Description,
            q.Notes,
            q.CreationDate,
            q.LastUpdateDate,
            q.IssueDate,
            q.ValidityDate
        );
}
