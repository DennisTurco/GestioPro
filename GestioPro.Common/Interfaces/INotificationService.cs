using GestioPro.Common.DTOs;
using GestioPro.Common.Models;

namespace GestioPro.Common.Interfaces;

public interface INotificationService
{
    Task<int> CountByDateAndDescriptionAsync(DateTimeOffset date, string description);
    Task<List<NotificationResponseDTO>> GetAllByUserIdAsync(Guid userId);
    Task<List<NotificationResponseDTO>> CreateAsync(NotificationRequestDTO dto);
    Task<NotificationResponseDTO> CreateByUserIdAsync(NotificationRequestDTO dto, Guid userId);
    Task<NotificationResponseDTO> MarkAsReadAsync(long id);
    Task DeleteAsync(long id);
    Task<List<PendingEmailNotificationDTO>> GetPendingEmailsAsync(DateTimeOffset since);
    /// <summary>Marks the email as sent unless another instance already did: false means skip it</summary>
    Task<bool> TryClaimEmailAsync(long id);
    /// <summary>Undoes a claim after a failed send, so the email is retried</summary>
    Task ReleaseEmailClaimAsync(long id);
}
