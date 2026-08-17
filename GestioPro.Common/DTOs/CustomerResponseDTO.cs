using GestioPro.Common.Enums;

namespace GestioPro.Common.DTOs;

public record CustomerResponseDTO(
    long Id,
    CustomerType CustomerType,
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
    DateTimeOffset LastUpdateDate,
    bool IsDisabled,
    int QuotationCount,
    int ContractCount
);
