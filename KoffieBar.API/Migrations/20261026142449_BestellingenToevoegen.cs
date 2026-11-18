using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KoffieBar.API.Migrations
{
    /// <inheritdoc />
    public partial class BestellingenToevoegen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Bestellingen",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    BesteldOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    KlantId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bestellingen", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bestellingen_AspNetUsers_KlantId",
                        column: x => x.KlantId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bestelregels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    BestellingId = table.Column<int>(type: "INTEGER", nullable: false),
                    ProductId = table.Column<int>(type: "INTEGER", nullable: false),
                    Aantal = table.Column<int>(type: "INTEGER", nullable: false),
                    GrootteCode = table.Column<string>(type: "TEXT", nullable: true),
                    Eenheidsprijs = table.Column<decimal>(type: "TEXT", nullable: false),
                    AantalMetKorting = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bestelregels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bestelregels_Bestellingen_BestellingId",
                        column: x => x.BestellingId,
                        principalTable: "Bestellingen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bestelregels_Producten_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Producten",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BestelregelExtras",
                columns: table => new
                {
                    BestelregelId = table.Column<int>(type: "INTEGER", nullable: false),
                    ExtraId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BestelregelExtras", x => new { x.BestelregelId, x.ExtraId });
                    table.ForeignKey(
                        name: "FK_BestelregelExtras_Bestelregels_BestelregelId",
                        column: x => x.BestelregelId,
                        principalTable: "Bestelregels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BestelregelExtras_Extras_ExtraId",
                        column: x => x.ExtraId,
                        principalTable: "Extras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bestellingen_KlantId",
                table: "Bestellingen",
                column: "KlantId");

            migrationBuilder.CreateIndex(
                name: "IX_BestelregelExtras_ExtraId",
                table: "BestelregelExtras",
                column: "ExtraId");

            migrationBuilder.CreateIndex(
                name: "IX_Bestelregels_BestellingId",
                table: "Bestelregels",
                column: "BestellingId");

            migrationBuilder.CreateIndex(
                name: "IX_Bestelregels_ProductId",
                table: "Bestelregels",
                column: "ProductId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BestelregelExtras");

            migrationBuilder.DropTable(
                name: "Bestelregels");

            migrationBuilder.DropTable(
                name: "Bestellingen");
        }
    }
}
