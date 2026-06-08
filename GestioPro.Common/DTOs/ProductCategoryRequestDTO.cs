using System.ComponentModel.DataAnnotations;

namespace GestioPro.Common.DTOs;

public record ProductCategoryRequestDTO(
    [Required, MaxLength(100)] string Name
);
