using GestioPro.Common;
using GestioPro.Common.Interfaces;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace GestioPro.Infrastructure.Services;

public class MailService(ISettingsService settingService, IConfiguration configuration) : IMailService
{
    public async Task SendEmailAsync(IEnumerable<Address> to, string subject, string htmlBody)
    {
        if (!to.Any())
            throw new InvalidDataException("Impossible send the email because there are not destination address");

        var companyName = (await settingService.GetByCodeAsync("CompanyName"))?.Value;
        var companyEmail = (await settingService.GetByCodeAsync("Email"))?.Value;

        if (string.IsNullOrWhiteSpace(companyName))
            companyName = "GestioPro";
        if (string.IsNullOrWhiteSpace(companyEmail))
            throw new InvalidDataException("Impossible send the email because the Email filed in settings form is empty");

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
        var smtpHost = configuration.GetValue<string>("Smtp:Host") ?? "localhost";
        var smtpPort = configuration.GetValue<int?>("Smtp:Port") ?? 1025;

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(smtpHost, smtpPort, MailKit.Security.SecureSocketOptions.None);
        await smtp.SendAsync(message);
        await smtp.DisconnectAsync(true);
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
