using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KoffieBar.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateKoffieModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bestellingen_AspNetUsers_KlantId",
                table: "Bestellingen");

            migrationBuilder.AlterColumn<string>(
                name: "KlantId",
                table: "Bestellingen",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AddForeignKey(
                name: "FK_Bestellingen_AspNetUsers_KlantId",
                table: "Bestellingen",
                column: "KlantId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bestellingen_AspNetUsers_KlantId",
                table: "Bestellingen");

            migrationBuilder.AlterColumn<string>(
                name: "KlantId",
                table: "Bestellingen",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Bestellingen_AspNetUsers_KlantId",
                table: "Bestellingen",
                column: "KlantId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
