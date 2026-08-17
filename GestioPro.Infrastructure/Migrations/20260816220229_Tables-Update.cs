using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestioPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TablesUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDisabled",
                table: "products",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDisabled",
                table: "product_categories",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDisabled",
                table: "invoices",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDisabled",
                table: "customers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDisabled",
                table: "contract_renewals",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDisabled",
                table: "products");

            migrationBuilder.DropColumn(
                name: "IsDisabled",
                table: "product_categories");

            migrationBuilder.DropColumn(
                name: "IsDisabled",
                table: "invoices");

            migrationBuilder.DropColumn(
                name: "IsDisabled",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "IsDisabled",
                table: "contract_renewals");
        }
    }
}
