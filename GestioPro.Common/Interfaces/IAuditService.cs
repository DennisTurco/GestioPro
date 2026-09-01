using GestioPro.Common.DTOs;

namespace GestioPro.Common.Interfaces;

public interface IAuditService
{
    Task<List<AuditResponseDTO>> GetAuditsAsync();
    Task<AuditResponseDTO> GetAuditByIdAsync(long id);
    Task LogAsync(string action, string entityType, string entityId, object? oldValues = null, object? newValues = null);
}
