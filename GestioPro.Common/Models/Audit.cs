using GestioPro.Common.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestioPro.Common.Models;

[Table("audit_logs")]
public class Audit
{
    [Key]
    public long Id { get; set; }

    [Required]
    public DateTimeOffset Timestamp { get; set; }

    [Required]
    public Guid UserId { get; set; }

    [Required]
    public required string Username { get; set; }

    [Required]
    public required string Action { get; set; }

    [Required]
    public required string EntityType { get; set; }

    [Required]
    public required string EntityId { get; set; }

    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? IpAddress { get; set; }
}
