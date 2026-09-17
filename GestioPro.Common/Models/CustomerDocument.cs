using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestioPro.Common.Models;

[Table("customer_documents")]
public class CustomerDocument
{
    [Key]
    public long Id { get; set; }

    [Required]
    public long CustomerId { get; set; }

    [ForeignKey(nameof(CustomerId))]
    public Customer Customer { get; set; } = null!;

    [Required]
    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string ContentType { get; set; } = string.Empty;

    [Required]
    public long SizeBytes { get; set; }

    [Required]
    public byte[] Content { get; set; } = [];

    [Required]
    public DateTimeOffset UploadDate { get; set; }
}
