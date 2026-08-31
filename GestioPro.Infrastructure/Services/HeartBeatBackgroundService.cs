using GestioPro.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace GestioPro.Infrastructure.Services;

/// <summary>
/// Periodically writes to the heartbeat table so the database is never idle long enough
/// for a Supabase free-tier project to auto-pause.
/// </summary>
public class HeartBeatBackgroundService(
    IServiceScopeFactory scopeFactory,
    IConfiguration configuration,
    ILogger<HeartBeatBackgroundService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalHours = configuration.GetValue<double?>("HeartBeat:IntervalHours") ?? 12;
        var interval = TimeSpan.FromHours(intervalHours);

        using var timer = new PeriodicTimer(interval);

        do
        {
            await PingAsync(stoppingToken);
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task PingAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            var heartBeatService = scope.ServiceProvider.GetRequiredService<IHeartBeatService>();
            var result = await heartBeatService.PingAsync();
            logger.LogInformation("Heartbeat ping sent at {LastPing}", result.LastPing);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            // shutting down
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Heartbeat ping failed");
        }
    }
}
