using GestioPro.Common.DTOs;

namespace GestioPro.Common.Interfaces;

public interface IQuotationService
{
    Task<List<QuotationResponseDTO>> GetAllAsync();
    Task<QuotationResponseDTO?> GetByIdAsync(long id);
    Task CreateAsync(QuotationRequestDTO dto);
    Task<QuotationResponseDTO> UpdateAsync(long id, QuotationRequestDTO dto);
    Task DeleteAsync(long id);
}
