using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestioPro.Common.Models;

[Table("notifications")]
public class Notification
{
    [Key]
    public long Id { get; set; }

    [Required]
    public Guid UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    public required string Summary { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }

    public bool IsRead { get; set; } = false;

    public DateTimeOffset CreationDate { get; set; }
}
