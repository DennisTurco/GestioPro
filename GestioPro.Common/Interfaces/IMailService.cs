namespace GestioPro.Common.Interfaces;

public interface IMailService
{
    Task SendEmailAsync(IEnumerable<Address> to, string subject, string htmlBody);
}
