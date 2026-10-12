namespace GestioPro.Common.DTOs;

/// <summary>
/// Notification still waiting to be delivered by email to its user
/// </summary>
public record PendingEmailNotificationDTO(
    long Id,
    string Summary,
    string? Description,
    string UserName,
    string UserEmail
);
