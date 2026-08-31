namespace GestioPro.Common.DTOs;

public record HeartBeatResponseDTO(
    DateTimeOffset LastPing
);
