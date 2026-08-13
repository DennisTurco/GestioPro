using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GestioPro.Common.Enums;

namespace GestioPro.Common.Models;

[Table("quotations")]
public class Quotation
{
    [Key]
    public long Id { get; set; }

    [Required]
    public long CustomerId { get; set; }

    [ForeignKey(nameof(CustomerId))]
    public Customer Customer { get; set; } = null!;

    public QuotationStatus QuotationStatus { get; set; }

    [Required]
    public string Number { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public required string Title { get; set; }

    [Required]
    [Range(0, float.MaxValue)]
    public float Amount { get; set; }

    [Required]
    [Range(0, 100)]
    public int VatPercentage { get; set; }

    [Required]
    [Range(0, 100)]
    public int DiscountPercentage { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    [Required]
    public DateTimeOffset CreationDate { get; set; }

    [Required]
    public DateTimeOffset LastUpdateDate { get; set; }

    public DateOnly? IssueDate { get; set; }
    public DateOnly? ValidityDate { get; set; }

    [Required]
    public bool IsDisabled { get; set; }
}
