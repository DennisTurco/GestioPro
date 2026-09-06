using GestioPro.Common;
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
                var notificationRequest = NotificationMessages.ContractExpiration(contract.Title, contract.Number, contract.EndDate);
                if (contract.Status == ContractStatus.Expiring)
                {
                    // check if the notification is already sent in the last 1 month
                    var count = await notificationService.CountByDateAndDescriptionAsync(DateTimeOffset.UtcNow.AddMonths(-1), notificationRequest.Description ?? "");
                    if (count > 0)
                        continue;

                    var result = await notificationService.CreateAsync(notificationRequest);
                    logger.LogInformation("Exiration notification sent for contract: {ContractTitle}", contract.Title);
                }
            }
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
}
