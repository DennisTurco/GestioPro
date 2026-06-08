using GestioPro.Common.DTOs;

namespace GestioPro.Common.Interfaces;

public interface IProductCategoryService
{
    Task<List<ProductCategoryResponseDTO>> GetAllAsync();
    Task<ProductCategoryResponseDTO?> GetByIdAsync(long id);
    Task CreateAsync(ProductCategoryRequestDTO dto);
    Task<ProductCategoryResponseDTO> UpdateAsync(long id, ProductCategoryRequestDTO dto);
    Task DeleteAsync(long id);
}
