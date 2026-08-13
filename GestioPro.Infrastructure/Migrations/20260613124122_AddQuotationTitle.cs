using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestioPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddQuotationTitle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "quotations",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Title",
                table: "quotations");
        }
    }
}
