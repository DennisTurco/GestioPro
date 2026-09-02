using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestioPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProductItemType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte>(
                name: "ItemType",
                table: "products",
                type: "smallint",
                nullable: false,
                defaultValue: (byte)1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ItemType",
                table: "products");
        }
    }
}
