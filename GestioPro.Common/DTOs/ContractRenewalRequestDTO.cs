using System.ComponentModel.DataAnnotations;

namespace GestioPro.Common.DTOs;

public record ContractRenewalRequestDTO(
    [Required] long ContractId,
    [Required, Range(0, float.MaxValue)] float Amount,
    [Required] DateOnly StartDate,
    [MaxLength(1000)] string? Notes
);
