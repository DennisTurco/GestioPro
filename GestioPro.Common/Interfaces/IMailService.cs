namespace GestioPro.Common.Interfaces;

public interface IMailService
{
    /// <param name="smtp">server to use instead of the saved one (e.g. to test settings before saving them)</param>
    Task SendEmailAsync(IEnumerable<Address> to, string subject, string htmlBody, SmtpConfiguration? smtp = null);
    Task<bool> IsConfiguredAsync();
}
