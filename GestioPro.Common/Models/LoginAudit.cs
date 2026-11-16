using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestioPro.Common.Models;

[Table("login_audit")]
public class LoginAudit
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
    public required string Status { get; set; }

    public required string Notes { get; set; }

    public string? IpAddress { get; set; }
}
