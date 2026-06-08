using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GestioPro.Common.Enums;

namespace GestioPro.Common.Models;

[Table("quotation_statuses")]
public class QuotationStatus
{
    [Key]
    public long Id { get; set; }

    [Required]
    [Column(TypeName = "varchar(20)")]
    public QuotationStatusEnum Name { get; set; }
}
