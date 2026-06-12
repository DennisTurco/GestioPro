using GestioPro.Common.Enums;
using System.ComponentModel.DataAnnotations;

namespace GestioPro.Common.DTOs;

public record CustomerRequestDTO(
    CustomerType CustomerType,

    [Required, MaxLength(50)] string Name,
    [Required, MaxLength(50)] string Surname,
    [Required, EmailAddress, MaxLength(50)] string Email,
    [RegularExpression(@"^[0-9+ ]*$", ErrorMessage = "Il telefono può contenere solo numeri, + e spazi"), MaxLength(20)] string Phone,

    string? Country,
    string? Region,
    string? City,
    string? Province,
    string? Address,

    string? VatNumber,
    string? CompanyName,
    string? TaxCode,

    [RegularExpression(@"^[0-9+ ]*$", ErrorMessage = "Il telefono può contenere solo numeri, + e spazi"), MaxLength(20)] string? Landline,

    double? Lat,
    double? Lon,

    [MaxLength(1000)] string? Notes
);
