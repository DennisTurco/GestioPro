using GestioPro.Common.DTOs;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using GestioPro.Common.Models;
using GestioPro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GestioPro.Infrastructure.Services;

public class ContractRenewalService(AppDbContext context, IAuditService auditService) : IContractRenewalService
{
    public async Task<List<ContractRenewalResponseDTO>> GetByContractIdAsync(long contractId)
        => await context.ContractRenewals
            .AsNoTracking()
            .Where(r => r.ContractId == contractId && !r.IsDisabled)
            .OrderByDescending(r => r.RenewalDate)
            .Select(r => MapToDto(r))
            .ToListAsync();

    public async Task DeleteAsync(long id)
    {
        var renewal = await context.ContractRenewals
            .FirstOrDefaultAsync(r => r.Id == id)
            ?? throw new BusinessException("Rinnovo non trovato");

        renewal.IsDisabled = true;
        await context.SaveChangesAsync();

        await auditService.LogAsync("Delete", nameof(ContractRenewal), renewal.Id.ToString(), MapToDto(renewal));
    }

    private static ContractRenewalResponseDTO MapToDto(ContractRenewal r)
        => new(r.Id, r.ContractId, r.Amount, r.StartDate, r.EndDate, r.RenewalDate, r.Notes);
}
