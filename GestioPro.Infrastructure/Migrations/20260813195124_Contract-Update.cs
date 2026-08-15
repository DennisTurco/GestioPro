using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestioPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ContractUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateOnly>(
                name: "StartDate",
                table: "contracts",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.AddColumn<float>(
                name: "Amount",
                table: "contracts",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreationDate",
                table: "contracts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "contracts",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FilePath",
                table: "contracts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastUpdateDate",
                table: "contracts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "contracts",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Number",
                table: "contracts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "contracts",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "VatPercentage",
                table: "contracts",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Amount",
                table: "contracts");

            migrationBuilder.DropColumn(
                name: "CreationDate",
                table: "contracts");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "contracts");

            migrationBuilder.DropColumn(
                name: "FilePath",
                table: "contracts");

            migrationBuilder.DropColumn(
                name: "LastUpdateDate",
                table: "contracts");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "contracts");

            migrationBuilder.DropColumn(
                name: "Number",
                table: "contracts");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "contracts");

            migrationBuilder.DropColumn(
                name: "VatPercentage",
                table: "contracts");

            migrationBuilder.AlterColumn<DateOnly>(
                name: "StartDate",
                table: "contracts",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1),
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);
        }
    }
}
