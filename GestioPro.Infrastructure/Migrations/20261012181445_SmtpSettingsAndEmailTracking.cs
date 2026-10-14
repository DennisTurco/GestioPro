using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GestioPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SmtpSettingsAndEmailTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EmailRequired",
                table: "notifications",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "EmailSentDate",
                table: "notifications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.InsertData(
                table: "settings",
                columns: new[] { "Code", "Description", "LastUpdateDate", "Value" },
                values: new object[,]
                {
                    { "SmtpHost", "SMTP server host for outgoing emails (empty = emails disabled)", null, null },
                    { "SmtpPassword", "SMTP login password, never returned by the API", null, null },
                    { "SmtpPort", "SMTP server port", null, null },
                    { "SmtpSecurity", "SMTP connection security: None, Auto, StartTls, SslOnConnect", null, null },
                    { "SmtpUsername", "SMTP login username", null, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "settings",
                keyColumn: "Code",
                keyValue: "SmtpHost");

            migrationBuilder.DeleteData(
                table: "settings",
                keyColumn: "Code",
                keyValue: "SmtpPassword");

            migrationBuilder.DeleteData(
                table: "settings",
                keyColumn: "Code",
                keyValue: "SmtpPort");

            migrationBuilder.DeleteData(
                table: "settings",
                keyColumn: "Code",
                keyValue: "SmtpSecurity");

            migrationBuilder.DeleteData(
                table: "settings",
                keyColumn: "Code",
                keyValue: "SmtpUsername");

            migrationBuilder.DropColumn(
                name: "EmailRequired",
                table: "notifications");

            migrationBuilder.DropColumn(
                name: "EmailSentDate",
                table: "notifications");
        }
    }
}
