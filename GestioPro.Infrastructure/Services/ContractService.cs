using GestioPro.Common.DTOs;
using GestioPro.Common.Helpers;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using GestioPro.Common.Models;
using GestioPro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using StringKit;

namespace GestioPro.Infrastructure.Services;

public class ContractService(AppDbContext context, IAuditService auditService) : IContractService
{
    public async Task<List<ContractResponseDTO>> GetAllAsync()
    {
        var contracts = await context.Contracts
            .Include(c => c.Quotation)
            .Include(c => c.Renewals)
            .AsNoTracking()
            .ToListAsync();

        return contracts.ConvertAll(MapToDto);
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

        await auditService.LogAsync("Create", nameof(Contract), contract.Id.ToString(), newValues: MapToDto(contract));

        var renewal = CreateRenewal(contract);
        await context.AddAsync(renewal);
        await context.SaveChangesAsync();

        await auditService.LogAsync("Create", nameof(ContractRenewal), renewal.Id.ToString(), newValues: MapToDto(renewal));
    }

    public async Task<ContractResponseDTO> UpdateAsync(long id, ContractRequestDTO dto)
    {
        var contract = await context.Contracts
            .Include(x => x.Quotation)
            .FirstOrDefaultAsync(x => x.Id == id) ?? throw new BusinessException("Contratto non trovato");

        var oldValues = MapToDto(contract);

        contract.QuotationId = dto.QuotationId;
        contract.Title = dto.Title;
        contract.Amount = dto.Amount;
        contract.VatPercentage = dto.VatPercentage;
        contract.Description = dto.Description;
        contract.Notes = dto.Notes;
        contract.LastUpdateDate = DateTimeOffset.UtcNow;
        contract.FilePath = dto.FilePath;

        await context.SaveChangesAsync();
        var newValues = MapToDto(contract);

        await auditService.LogAsync("Update", nameof(Contract), contract.Id.ToString(), oldValues, newValues);

        return newValues;
    }

    public async Task<ContractResponseDTO> RenewalAsync(long id)
    {
        var contract = await context.Contracts
            .Include(x => x.Quotation)
            .Include(x => x.Renewals)
            .FirstOrDefaultAsync(x => x.Id == id) ?? throw new BusinessException("Contratto non trovato");

        var renewal = CreateRenewal(contract);
        var oldValues = MapToDto(contract);

        contract.EndDate = renewal.EndDate;
        contract.LastUpdateDate = renewal.RenewalDate;

        await context.AddAsync(renewal);
        await context.SaveChangesAsync();

        var newValues = MapToDto(contract);

        await auditService.LogAsync("Update", nameof(Contract), contract.Id.ToString(), oldValues, newValues);
        await auditService.LogAsync("Create", nameof(ContractRenewal), renewal.Id.ToString(), newValues: MapToDto(renewal));

        return newValues;
    }

    public async Task DeleteAsync(long id)
    {
        var contract = await context.Contracts
            .Include(c => c.Quotation)
            .Include(c => c.Renewals)
            .FirstOrDefaultAsync(c => c.Id == id) ?? throw new BusinessException("Contratto non trovato");

        var oldValues = MapToDto(contract);

        context.Contracts.Remove(contract);
        await context.SaveChangesAsync();

        await auditService.LogAsync("Delete", nameof(Contract), contract.Id.ToString(), oldValues);
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

    private static ContractRenewalResponseDTO MapToDto(ContractRenewal r)
        => new (
            r.Id,
            r.ContractId,
            r.Amount,
            r.StartDate,
            r.EndDate,
            r.RenewalDate,
            r.Notes
        );

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
