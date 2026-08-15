using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestioPro.Common.Models;

[Table("contract_renewals")]
public class ContractRenewal
{
    [Key]
    public long Id { get; set; }

    [Required]
    public long ContractId { get; set; }

    [ForeignKey(nameof(ContractId))]
    public Contract Contract { get; set; } = null!;

    [Required, Range(0, float.MaxValue)]
    public float Amount { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    [Required]
    public DateTimeOffset RenewalDate { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
