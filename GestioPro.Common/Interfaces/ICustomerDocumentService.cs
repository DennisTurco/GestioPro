using GestioPro.Common.DTOs;

namespace GestioPro.Common.Interfaces;

public interface ICustomerDocumentService
{
    Task<List<CustomerDocumentResponseDTO>> GetByCustomerIdAsync(long customerId);
    Task<CustomerDocumentResponseDTO> UploadAsync(long customerId, string fileName, string contentType, long sizeBytes, Stream content);
    Task<(byte[] Content, string ContentType, string FileName)> DownloadAsync(long id);
    Task DeleteAsync(long id);
}
