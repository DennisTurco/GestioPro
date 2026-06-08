using GestioPro.Common.DTOs;

namespace GestioPro.Common.Interfaces;

public interface IProductService
{
    Task<List<ProductResponseDTO>> GetAllAsync();
    Task<ProductResponseDTO?> GetByIdAsync(long id);
    Task CreateAsync(ProductRequestDTO dto);
    Task<ProductResponseDTO> UpdateAsync(long id, ProductRequestDTO dto);
    Task DeleteAsync(long id);
}
