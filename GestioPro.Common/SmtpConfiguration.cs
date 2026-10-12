namespace GestioPro.Common;

/// <param name="Security">MailKit SecureSocketOptions name (None, Auto, StartTls, SslOnConnect)</param>
public record SmtpConfiguration(string Host, int Port, string Security, string? Username, string? Password);
