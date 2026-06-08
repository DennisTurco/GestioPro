using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestioPro.Common.Models;

[Table("customers")]
public class Customer
{
    [Key]
    public long Id { get; set; }

    [Required]
    public long CustomerTypeId { get; set; }

    [ForeignKey(nameof(CustomerTypeId))]
    public CustomerType CustomerType { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Surname { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    public string? Country { get; set; }
    public string? Region { get; set; }
    public string? City { get; set; }
    public string? Province { get; set; }
    public string? Address { get; set; }

    public string? VatNumber { get; set; }
    public string? CompanyName { get; set; }
    public string? TaxCode { get; set; }
    public string? Landline { get; set; }

    public double? Lat { get; set; }
    public double? Lon { get; set; }

    public DateOnly InsertDate { get; set; }
    public DateOnly LastUpdateDate { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
