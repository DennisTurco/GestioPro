using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GestioPro.Common.Enums;

namespace GestioPro.Common.Models;

[Table("product_categories")]
public class ProductCategory
{
    [Key]
    public long Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}
