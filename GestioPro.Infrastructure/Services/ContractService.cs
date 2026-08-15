using GestioPro.Common.DTOs;
using GestioPro.Common.Helpers;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using GestioPro.Common.Models;
using GestioPro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using StringKit;

namespace GestioPro.Infrastructure.Services;

public class ContractService(AppDbContext context) : IContractService
{
    public async Task<List<ContractResponseDTO>> GetAllAsync()
    {
        var contracts = await context.Contracts
            .Include(c => c.Quotation)
            .Include(c => c.Renewals)
            .AsNoTracking()
            .ToListAsync();

        return contracts.Select(MapToDto).ToList();
    }

    public async Task<ContractResponseDTO?> GetByIdAsync(long id)
    {
        var contract = await context.Contracts
            .Include(c => c.Quotation)
            .Include(c => c.Renewals)
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        return contract is null ? null : MapToDto(contract);
    }

    public async Task CreateAsync(ContractRequestDTO dto)
    {
        var existing = await context.Contracts
            .FirstOrDefaultAsync(c => c.Number == dto.Number);

        if (existing is not null)
            throw new BusinessException("Esiste già un contratto con lo stesso numero");

        DateTimeOffset now = DateTimeOffset.UtcNow;
        var contract = new Contract
        {
            QuotationId = dto.QuotationId,
            ContractType = dto.ContractType,
            Number = dto.Number,
            Title = dto.Title,
            Amount = dto.Amount,
            VatPercentage = dto.VatPercentage,
            Description = dto.Description,
            Notes = dto.Notes,
            CreationDate = now,
            LastUpdateDate = now,
            StartDate = dto.StartDate,
            EndDate = dto.StartDate.AddMonths(dto.ContractType.ToMonths()),
            FilePath = dto.FilePath
        };

        await context.AddAsync(contract);
        await context.SaveChangesAsync();

        var renewal = CreateRenewal(contract);
        await context.AddAsync(renewal);
        await context.SaveChangesAsync();
    }

    public async Task<ContractResponseDTO> UpdateAsync(long id, ContractRequestDTO dto)
    {
        var contract = await context.Contracts
            .Include(x => x.Quotation)
            .FirstOrDefaultAsync(x => x.Id == id) ?? throw new BusinessException("Contratto non trovato");

        contract.QuotationId = dto.QuotationId;
        contract.Title = dto.Title;
        contract.Amount = dto.Amount;
        contract.VatPercentage = dto.VatPercentage;
        contract.Description = dto.Description;
        contract.Notes = dto.Notes;
        contract.LastUpdateDate = DateTimeOffset.UtcNow;
        contract.FilePath = dto.FilePath;

        await context.SaveChangesAsync();
        return MapToDto(contract);
    }

    public async Task<ContractResponseDTO> RenewalAsync(long id)
    {
        var contract = await context.Contracts
            .Include(x => x.Quotation)
            .Include(x => x.Renewals)
            .FirstOrDefaultAsync(x => x.Id == id) ?? throw new BusinessException("Contratto non trovato");

        var renewal = CreateRenewal(contract);

        contract.EndDate = renewal.EndDate;
        contract.LastUpdateDate = renewal.RenewalDate;

        await context.AddAsync(renewal);
        await context.SaveChangesAsync();
        return MapToDto(contract);
    }

    public async Task<string> CalculateNextNumberAsync(long quotationId, string quotationNumber)
    {
        if (quotationNumber.IsNullOrWhiteSpace())
            throw new BusinessException("Il numero del preventivo non può essere vuoto");

        var lastContract = await context.Contracts
            .OrderByDescending(x => x.Number)
            .FirstOrDefaultAsync(x => x.QuotationId == quotationId);

        var number = quotationNumber.Split('-');

        var lastContractNumber = lastContract is not null ? lastContract.Number.Split('-')[2].GetNext() : "001";

        return $"{number[0]}-{number[1]}-{lastContractNumber}";
    }

    private static ContractRenewal CreateRenewal(Contract contract)
        => new ()
        {
            ContractId = contract.Id,
            Amount     = contract.Amount,
            StartDate  = contract.EndDate,
            EndDate    = ContractTypeExtensions.ExtendEndDateByContractType(contract.EndDate, contract.ContractType),
            RenewalDate = DateTimeOffset.UtcNow,
        };

    private static ContractResponseDTO MapToDto(Contract c)
        => new (
            c.Id,
            c.QuotationId,
            c.ContractType,
            c.Number,
            c.Title,
            c.Amount,
            c.VatPercentage,
            c.Description,
            c.Notes,
            c.StartDate,
            c.EndDate,
            c.FilePath,
            c.CreationDate,
            c.LastUpdateDate,
            c.Status
        );
}
