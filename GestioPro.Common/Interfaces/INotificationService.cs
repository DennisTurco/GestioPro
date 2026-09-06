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
}
