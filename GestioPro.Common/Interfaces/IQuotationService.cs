using GestioPro.Common.DTOs;
using GestioPro.Common.Enums;

namespace GestioPro.Common.Interfaces;

public interface IQuotationService
{
    Task<List<QuotationResponseDTO>> GetAllAsync();
    Task<QuotationResponseDTO?> GetByIdAsync(long id);
    Task<QuotationResponseDTO> CreateAsync(QuotationRequestDTO dto);
    Task<QuotationResponseDTO> UpdateAsync(long id, QuotationRequestDTO dto);
    Task<QuotationResponseDTO> UpdateStatusAsync(long id, QuotationStatus status);
    Task DisableAsync(long id);
    Task<string> CalculateNextNumberAsync();
}
