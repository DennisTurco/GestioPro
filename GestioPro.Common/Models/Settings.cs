using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestioPro.Common.Models;

[Table("settings")]
public class Settings
{
    [Key]
    public string Code { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Value { get; set; }

    [MaxLength(455)]
    public string? Description { get; set; }

    public DateTimeOffset? LastUpdateDate { get; set; }
}
