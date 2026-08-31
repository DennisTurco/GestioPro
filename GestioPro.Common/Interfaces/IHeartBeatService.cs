using GestioPro.Common.DTOs;

namespace GestioPro.Common.Interfaces;

public interface IHeartBeatService
{
    Task<HeartBeatResponseDTO> GetLastAsync();
    Task<HeartBeatResponseDTO> PingAsync();
}
