using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GestioPro.Common.Enums;

namespace GestioPro.Common.Models;

[Table("customer_types")]
public class CustomerType
{
    [Key]
    public long Id { get; set; }

    [Required]
    [Column(TypeName = "varchar(50)")]
    public CustomerTypeEnum Name { get; set; }
}
