using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KoffieBar.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBestellingStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Bestellingen",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Bestellingen");
        }
    }
}
