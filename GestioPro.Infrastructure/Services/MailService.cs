using GestioPro.Common;
using GestioPro.Common.Interfaces;
using MailKit.Net.Smtp;
using System.Net.Sockets;
using GestioPro.Common.Exceptions;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace GestioPro.Infrastructure.Services;

public class MailService(ISettingsService settingService, IConfiguration configuration) : IMailService
{
    public async Task<bool> IsConfiguredAsync()
        => await GetSmtpConfigurationAsync() is not null;

    public async Task SendEmailAsync(IEnumerable<Address> to, string subject, string htmlBody, SmtpConfiguration? smtpConfig = null)
    {
        smtpConfig ??= await GetSmtpConfigurationAsync()
            ?? throw new DomainException("Server email non configurato: impostalo in Impostazioni > Server email");

        if (!to.Any())
            throw new DomainException("Impossibile inviare l'email: nessun destinatario");

        var companyName = (await settingService.GetByCodeAsync("CompanyName"))?.Value;
        var companyEmail = (await settingService.GetByCodeAsync("Email"))?.Value;

        if (string.IsNullOrWhiteSpace(companyName))
            companyName = "GestioPro";
        // most providers only accept the authenticated account as sender
        if (string.IsNullOrWhiteSpace(companyEmail) && smtpConfig.Username?.Contains('@') == true)
            companyEmail = smtpConfig.Username;
        if (string.IsNullOrWhiteSpace(companyEmail))
            throw new DomainException("Impossibile inviare l'email: compila il campo Email in Impostazioni > Azienda");

        var fromAddress = new MailboxAddress(companyName, companyEmail);

        var message = new MimeMessage();
        message.From.Add(fromAddress);
        foreach (var t in to)
        {
            var toAddress = new MailboxAddress(t.Name, t.Email);
            message.To.Add(toAddress);
        }
        message.Subject = subject;
        var bb = new BodyBuilder
        {
            HtmlBody = BuildHtmlEmail(companyName, subject, htmlBody)
        };
        message.Body = bb.ToMessageBody();

        using var smtp = new SmtpClient { Timeout = 20_000 }; // a wrong host/port fails fast instead of hanging for minutes
        try
        {
            await smtp.ConnectAsync(smtpConfig.Host, smtpConfig.Port, Enum.Parse<SecureSocketOptions>(smtpConfig.Security));
            if (!string.IsNullOrWhiteSpace(smtpConfig.Username))
                await smtp.AuthenticateAsync(smtpConfig.Username, smtpConfig.Password ?? "");
        }
        catch (AuthenticationException)
        {
            throw new DomainException("Autenticazione SMTP fallita: controlla username e password");
        }
        catch (Exception ex) when (ex is SocketException or SslHandshakeException or SmtpProtocolException or IOException or TimeoutException or OperationCanceledException)
        {
            throw new DomainException($"Impossibile connettersi al server SMTP {smtpConfig.Host}:{smtpConfig.Port} ({ex.Message})");
        }

        try
        {
            await smtp.SendAsync(message);
        }
        catch (SmtpCommandException ex)
        {
            throw new DomainException($"Il server SMTP ha rifiutato l'email: {ex.Message}");
        }
        await smtp.DisconnectAsync(true);
    }

    // The server configured by an admin in Impostazioni wins; appsettings "Smtp"
    // is only a fallback for development (Mailpit, see appsettings.Development.json)
    private async Task<SmtpConfiguration?> GetSmtpConfigurationAsync()
    {
        var saved = await settingService.GetSmtpConfigurationAsync();
        if (saved is not null) return saved;

        var host = configuration.GetValue<string>("Smtp:Host");
        if (string.IsNullOrWhiteSpace(host)) return null;

        return new SmtpConfiguration(
            host,
            configuration.GetValue<int?>("Smtp:Port") ?? 25,
            configuration.GetValue<string>("Smtp:Security") ?? "None",
            configuration.GetValue<string>("Smtp:Username"),
            configuration.GetValue<string>("Smtp:Password"));
    }

    private static string BuildHtmlEmail(string companyName, string subject, string bodyText)
    {
        var initial = companyName.Length > 0 ? companyName[..1].ToUpperInvariant() : "G";
        var paragraphs = bodyText
            .Replace("\r\n", "\n")
            .Split('\n', StringSplitOptions.RemoveEmptyEntries)
            .Select(line => $"<p style=\"margin:0 0 12px;font-size:14px;line-height:1.6;color:#374151\">{System.Net.WebUtility.HtmlEncode(line)}</p>");

        return $"""
        <!DOCTYPE html>
        <html lang="it">
          <body style="margin:0;padding:24px 0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
                    <tr>
                      <td style="background:#2563eb;padding:20px 28px;display:flex">
                        <table role="presentation" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width:36px;height:36px;background:rgba(255,255,255,0.15);border-radius:8px;text-align:center;vertical-align:middle;color:#ffffff;font-size:16px;font-weight:700">{initial}</td>
                            <td style="padding-left:12px;color:#ffffff;font-size:16px;font-weight:700;vertical-align:middle">{System.Net.WebUtility.HtmlEncode(companyName)}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:28px">
                        <h1 style="margin:0 0 16px;font-size:18px;color:#111827">{System.Net.WebUtility.HtmlEncode(subject)}</h1>
                        {string.Concat(paragraphs)}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:16px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af">
                        {System.Net.WebUtility.HtmlEncode(companyName)} &nbsp;&bull;&nbsp; Notifica automatica generata da GestioPro
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
        """;
    }
}
