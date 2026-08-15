using GestioPro.Common.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestioPro.Common.Models;

[Table("contracts")]
public class Contract
{
    [Key]
    public long Id { get; set; }

    [Required]
    public long QuotationId { get; set; }

    [ForeignKey(nameof(QuotationId))]
    public Quotation Quotation { get; set; } = null!;

    public ContractType ContractType { get; set; }

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

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public string? FilePath { get; set; }

    [Required]
    public DateTimeOffset CreationDate { get; set; }

    [Required]
    public DateTimeOffset LastUpdateDate { get; set; }

    public ICollection<ContractRenewal> Renewals { get; set; } = [];

    [NotMapped]
    public float TotalAmount => Renewals.Sum(r => r.Amount);

    [NotMapped]
    public string Status => EndDate switch
    {
        var d when d < DateOnly.FromDateTime(DateTime.Today) => "Scaduto",
        var d when d < DateOnly.FromDateTime(DateTime.Today).AddDays(14) => "In scadenza",
        _ => "Attivo"
    };
}
