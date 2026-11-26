using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KoffieBar.API.Migrations
{
    /// <inheritdoc />
    public partial class VoegIsEspressoToe : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsEspresso",
                table: "Producten",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Producten",
                keyColumn: "Id",
                keyValue: 1,
                column: "IsEspresso",
                value: false);

            migrationBuilder.UpdateData(
                table: "Producten",
                keyColumn: "Id",
                keyValue: 2,
                column: "IsEspresso",
                value: true);

            migrationBuilder.UpdateData(
                table: "Producten",
                keyColumn: "Id",
                keyValue: 3,
                column: "IsEspresso",
                value: false);

            migrationBuilder.UpdateData(
                table: "Producten",
                keyColumn: "Id",
                keyValue: 4,
                column: "IsEspresso",
                value: false);

            migrationBuilder.UpdateData(
                table: "Producten",
                keyColumn: "Id",
                keyValue: 5,
                column: "IsEspresso",
                value: false);

            migrationBuilder.UpdateData(
                table: "Producten",
                keyColumn: "Id",
                keyValue: 6,
                column: "IsEspresso",
                value: false);

            migrationBuilder.UpdateData(
                table: "Producten",
                keyColumn: "Id",
                keyValue: 7,
                column: "IsEspresso",
                value: false);

            migrationBuilder.UpdateData(
                table: "Producten",
                keyColumn: "Id",
                keyValue: 8,
                column: "IsEspresso",
                value: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsEspresso",
                table: "Producten");
        }
    }
}
