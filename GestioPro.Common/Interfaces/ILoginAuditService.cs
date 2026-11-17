using GestioPro.Common.DTOs;

namespace GestioPro.Common.Interfaces;

public interface ILoginAuditService
{
    Task<List<LoginAuditResponseDTO>> GetAllAsync();
    Task LogAsync(Guid? userId, string? username, string action, string status, string? notes);
}
