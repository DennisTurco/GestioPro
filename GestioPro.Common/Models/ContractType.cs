using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GestioPro.Common.Enums;

namespace GestioPro.Common.Models;

[Table("contract_types")]
public class ContractType
{
    [Key]
    public long Id { get; set; }

    [Required]
    [Column(TypeName = "varchar(20)")]
    public ContractTypeEnum Name { get; set; }
}
