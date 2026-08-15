using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestioPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ContractUpdate2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_contracts_customers_CustomerId",
                table: "contracts");

            migrationBuilder.RenameColumn(
                name: "CustomerId",
                table: "contracts",
                newName: "QuotationId");

            migrationBuilder.RenameIndex(
                name: "IX_contracts_CustomerId",
                table: "contracts",
                newName: "IX_contracts_QuotationId");

            migrationBuilder.AddForeignKey(
                name: "FK_contracts_quotations_QuotationId",
                table: "contracts",
                column: "QuotationId",
                principalTable: "quotations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_contracts_quotations_QuotationId",
                table: "contracts");

            migrationBuilder.RenameColumn(
                name: "QuotationId",
                table: "contracts",
                newName: "CustomerId");

            migrationBuilder.RenameIndex(
                name: "IX_contracts_QuotationId",
                table: "contracts",
                newName: "IX_contracts_CustomerId");

            migrationBuilder.AddForeignKey(
                name: "FK_contracts_customers_CustomerId",
                table: "contracts",
                column: "CustomerId",
                principalTable: "customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
