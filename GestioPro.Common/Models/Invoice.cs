using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestioPro.Common.Models;

[Table("invoices")]
public class Invoice
{
    [Key]
    public long Id { get; set; }

    [Required]
    public string Number { get; set; } = string.Empty;

    [Required]
    public long CustomerId { get; set; }

    [ForeignKey(nameof(CustomerId))]
    public Customer Customer { get; set; } = null!;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    [Required]
    public int Status { get; set; }

    [Required]
    [Range(0, float.MaxValue)]
    public float Amount { get; set; } = 0;

    [Required]
    [Range(0, 100)]
    public int VatPercentage { get; set; } = 22;

    [Required]
    public bool IsDisabled { get; set; } = false; // soft delete
}
