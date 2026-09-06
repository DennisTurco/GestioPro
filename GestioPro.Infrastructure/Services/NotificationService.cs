using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using GestioPro.Common.Models;
using GestioPro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GestioPro.Infrastructure.Services;

// Audit logs are not necessary for this class
public class NotificationService(AppDbContext context) : INotificationService
{
    public async Task<List<NotificationResponseDTO>> GetAllByUserIdAsync(Guid userId)
        => await context.Notification
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .Select(x => MapToDTO(x))
            .ToListAsync();

    public async Task<int> CountByDateAndDescriptionAsync(DateTimeOffset date, string description)
        => await context.Notification
            .AsNoTracking()
            .CountAsync(x => x.CreationDate >= date && x.Description == description);

    public async Task<List<NotificationResponseDTO>> CreateAsync(NotificationRequestDTO dto)
    {
        var userIds = await context.Users.Select(u => u.Id).ToListAsync();

        var notifications = userIds.Select(userId => new Notification
        {
            UserId = userId,
            Summary = dto.Summary,
            Description = dto.Description,
            CreationDate = DateTimeOffset.UtcNow
        }).ToList();

        await context.AddRangeAsync(notifications);
        await context.SaveChangesAsync();

        return notifications.ConvertAll(MapToDTO);
    }

    public async Task<NotificationResponseDTO> CreateByUserIdAsync(NotificationRequestDTO dto, Guid userId)
    {
        var notification = new Notification
        {
            UserId = userId,
            Summary = dto.Summary,
            Description = dto.Description,
            CreationDate = DateTimeOffset.UtcNow
        };

        await context.AddAsync(notification);
        await context.SaveChangesAsync();

        return MapToDTO(notification);
    }

    public async Task<NotificationResponseDTO> MarkAsReadAsync(long id)
    {
        var notification = await context.Notification
            .FirstOrDefaultAsync(x => x.Id == id) ?? throw new ArgumentException("Notification log id does not exist");

        notification.IsRead = true;

        await context.SaveChangesAsync();

        return MapToDTO(notification);
    }

    public async Task DeleteAsync(long id)
    {
        var notification = await context.Notification
            .FirstOrDefaultAsync(x => x.Id == id) ?? throw new ArgumentException("Notification log id does not exist");

        context.Notification.Remove(notification);
        await context.SaveChangesAsync();
    }

    private static NotificationResponseDTO MapToDTO(Notification n)
        => new (
            n.Id,
            n.UserId,
            n.Summary,
            n.Description,
            n.IsRead,
            n.CreationDate
        );
}
