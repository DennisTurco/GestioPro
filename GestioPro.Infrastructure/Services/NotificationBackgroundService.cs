using GestioPro.Common;
using GestioPro.Common.DTOs;
using GestioPro.Common.Enums;
using GestioPro.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace GestioPro.Infrastructure.Services;

/// <summary>
/// Periodically check if notification are required
/// </summary>
public class NotificationBackgroundService(
    IServiceScopeFactory scopeFactory,
    IConfiguration configuration,
    ILogger<NotificationBackgroundService> logger) : BackgroundService
{
    private static readonly TimeSpan EmailRetryWindow = TimeSpan.FromDays(14);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalHours = configuration.GetValue<double?>("Notification:IntervalHours") ?? 12;
        var interval = TimeSpan.FromHours(intervalHours);

        using var timer = new PeriodicTimer(interval);

        do
        {
            await CreateExpirationNotificationAsync(stoppingToken);
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task CreateExpirationNotificationAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
            var contractService = scope.ServiceProvider.GetRequiredService<IContractService>();

            var contracts = await contractService.GetAllAsync();

            foreach (var contract in contracts)
            {
                if (contract.Status != ContractStatus.Expiring)
                    continue;

                var notificationRequest = NotificationMessages.ContractExpiration(contract.Title, contract.Number, contract.EndDate);

                // check if the notification is already sent in the last 1 month
                var count = await notificationService.CountByDateAndDescriptionAsync(DateTimeOffset.UtcNow.AddMonths(-1), notificationRequest.Description ?? "");
                if (count > 0)
                    continue;

                await notificationService.CreateAsync(notificationRequest);
                logger.LogInformation("Expiration notification sent for contract: {ContractTitle}", contract.Title);
            }

            // also picks up emails that failed on a previous run
            await SendPendingEmailsAsync(scope);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            // shutting down
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Notification failed!");
        }
    }

    private async Task SendPendingEmailsAsync(IServiceScope scope)
    {
        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
        var mailService = scope.ServiceProvider.GetRequiredService<IMailService>();

        // past this, the reminder is stale (the contract has likely expired or been renewed)
        var pending = await notificationService.GetPendingEmailsAsync(DateTimeOffset.UtcNow.Add(-EmailRetryWindow));
        if (pending.Count == 0)
            return;

        if (!await mailService.IsConfiguredAsync())
        {
            logger.LogInformation("Email server not configured: {Count} email(s) waiting", pending.Count);
            return;
        }

        foreach (var notification in pending)
        {
            // another instance of the app may be sending the same email
            if (!await notificationService.TryClaimEmailAsync(notification.Id))
                continue;

            try
            {
                await mailService.SendEmailAsync([new Address(notification.UserName, notification.UserEmail)], notification.Summary, notification.Description ?? "");
            }
            catch (Exception ex)
            {
                await notificationService.ReleaseEmailClaimAsync(notification.Id);
                logger.LogWarning(ex, "Cannot send the email '{Summary}' to {Email}, will retry: {Message}", notification.Summary, notification.UserEmail, ex.Message);
            }
        }
    }
}
