using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

    [Required]
    public long QuotationStatusId { get; set; }

    [ForeignKey(nameof(QuotationStatusId))]
    public QuotationStatus QuotationStatus { get; set; } = null!;

    [Required]
    public string Number { get; set; } = string.Empty;

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
    public DateOnly CreationDate { get; set; }

    [Required]
    public DateOnly LastUpdateDate { get; set; }

    public DateOnly? IssueDate { get; set; }
    public DateOnly? ValidityDate { get; set; }
}
