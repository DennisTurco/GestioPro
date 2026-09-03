namespace GestioPro.Common.DTOs;

public record CityLookupDTO(
    string City,
    string? Province,
    string? Region,
    double? Lat,
    double? Lon
);
