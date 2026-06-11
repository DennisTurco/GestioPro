namespace GestioPro.Common.DTOs;

public record CustomerResponseDTO(
    long Id,
    long CustomerTypeId,
    string CustomerTypeName,
    string Name,
    string Surname,
    string Email,
    string Phone,
    string? Country,
    string? Region,
    string? City,
    string? Province,
    string? Address,
    string? VatNumber,
    string? CompanyName,
    string? TaxCode,
    string? Landline,
    double? Lat,
    double? Lon,
    string? Notes,
    DateTimeOffset InsertDate,
    DateTimeOffset LastUpdateDate
);
