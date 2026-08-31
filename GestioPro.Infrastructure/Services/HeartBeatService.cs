using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using GestioPro.Common.Models;
using GestioPro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GestioPro.Infrastructure.Services;

public class HeartBeatService(AppDbContext context) : IHeartBeatService
{
    private const int RowId = 1;

    public async Task<HeartBeatResponseDTO> GetLastAsync()
    {
        var row = await context.HeartBeats.AsNoTracking().FirstOrDefaultAsync(h => h.Id == RowId);
        return new HeartBeatResponseDTO(row?.LastPing ?? default);
    }

    public async Task<HeartBeatResponseDTO> PingAsync()
    {
        var row = await context.HeartBeats.FirstOrDefaultAsync(h => h.Id == RowId);
        var now = DateTimeOffset.UtcNow;

        if (row is null)
        {
            row = new HeartBeat { Id = RowId, LastPing = now };
            context.HeartBeats.Add(row);
        }
        else
        {
            row.LastPing = now;
        }

        await context.SaveChangesAsync();

        return new HeartBeatResponseDTO(row.LastPing);
    }
}
