using GestioPro.Common.DTOs;

namespace GestioPro.Common.Interfaces;

public interface ICustomerService
{
    Task<List<CustomerResponseDTO>> GetAllAsync();
    Task<CustomerResponseDTO?> GetByIdAsync(long id);
    Task<CustomerResponseDTO> CreateAsync(CustomerRequestDTO dto);
    Task<CustomerResponseDTO> UpdateAsync(long id, CustomerRequestDTO dto);
    Task DeleteAsync(long id);
}
