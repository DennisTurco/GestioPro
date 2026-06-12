using System.ComponentModel.DataAnnotations;

namespace GestioPro.Common.DTOs;

public record LoginRequestDTO(
    [Required] string Username,
    [Required] string Password
);
