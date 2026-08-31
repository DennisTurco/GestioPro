using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestioPro.Common.Models;

[Table("heartbeat")]
public class HeartBeat
{
    [Key]
    public int Id { get; set; }

    public DateTimeOffset LastPing { get; set; }
}
