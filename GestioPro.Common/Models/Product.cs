using GestioPro.Common.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestioPro.Common.Models;

[Table("products")]
public class Product
{
    [Key]
    public long Id { get; set; }

    [Required]
    public long CategoryId { get; set; }

    [ForeignKey(nameof(CategoryId))]
    public ProductCategory Category { get; set; } = null!;

    public ProductStatus ProductStatus { get; set; }

    [Required]
    public string Code { get; set; } = string.Empty;

    public string? Ean { get; set; }

    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public int? Quantity { get; set; }

    [Required]
    [Range(0, 100)]
    public int VatPercentage { get; set; } = 22;

    [Required]
    [Range(0, double.MaxValue)]
    public float Price { get; set; }
}
