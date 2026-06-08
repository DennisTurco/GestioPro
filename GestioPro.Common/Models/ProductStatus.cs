using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GestioPro.Common.Enums;

namespace GestioPro.Common.Models;

[Table("product_statuses")]
public class ProductStatus
{
    [Key]
    public long Id { get; set; }

    [Required]
    [Column(TypeName = "varchar(20)")]
    public ProductStatusEnum Name { get; set; }
}
