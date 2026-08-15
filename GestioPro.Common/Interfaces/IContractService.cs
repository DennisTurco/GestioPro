using GestioPro.Common.DTOs;

namespace GestioPro.Common.Interfaces;

public interface IContractService
{
    public Task<List<ContractResponseDTO>> GetAllAsync();
    public Task<ContractResponseDTO?> GetByIdAsync(long id);
    public Task CreateAsync(ContractRequestDTO dto);
    public Task<ContractResponseDTO> UpdateAsync(long id, ContractRequestDTO dto);
    public Task<string> CalculateNextNumberAsync(long quotationId, string quotationNumber);
    public Task<ContractResponseDTO> RenewalAsync(long id);
}
