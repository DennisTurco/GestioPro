namespace GestioPro.Common.DTOs;

public record NotificationRequestDTO(
    string Summary,
    string? Description,
    bool SendEmail = false // also deliver by email to the users who enabled email notifications
);
