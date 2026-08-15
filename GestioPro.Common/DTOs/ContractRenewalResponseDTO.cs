namespace GestioPro.Common.DTOs;

public record ContractRenewalResponseDTO(
    long Id,
    long ContractId,
    float Amount,
    DateOnly StartDate,
    DateOnly EndDate,
    DateTimeOffset RenewalDate,
    string? Notes
);
