using GestioPro.Common.DTOs;

namespace GestioPro.Common.Interfaces;

public interface IContractRenewalService
{
    Task<List<ContractRenewalResponseDTO>> GetByContractIdAsync(long contractId);
    Task DeleteAsync(long id);
    Task DeleteAllByContractIdAsync(long contractId);
}
