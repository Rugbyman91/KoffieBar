using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace KoffieBar.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Extras",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Price = table.Column<decimal>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Extras", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Producten",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Allergies = table.Column<string>(type: "TEXT", nullable: false),
                    Price = table.Column<decimal>(type: "TEXT", nullable: false),
                    Categorie = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Producten", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Extras",
                columns: new[] { "Id", "Name", "Price" },
                values: new object[,]
                {
                    { 1, "Espresso", 1.2m },
                    { 2, "Melk", 0.5m },
                    { 3, "Suiker", 0.5m },
                    { 4, "Vegan melk", 0.8m }
                });

            migrationBuilder.InsertData(
                table: "Producten",
                columns: new[] { "Id", "Allergies", "Categorie", "Description", "Name", "Price" },
                values: new object[,]
                {
                    { 1, "geen", 1, "Espresso aangelengd met heet water", "Americano", 2.0m },
                    { 2, "geen", 1, "Een kleine, krachtige shot koffie", "Espresso", 1.5m },
                    { 3, "melk", 1, "Espresso met warme melk en een dikke schuimlaag", "Cappuccino", 3.0m },
                    { 4, "melk", 1, "Espresso met veel warme melk en een dun laagje schuim", "Latte", 3.0m },
                    { 5, "gluten, melk", 2, "Boterig bladerdeeg in halvemaanvorm", "Croissant", 1.75m },
                    { 6, "gluten, melk", 2, "Bladerdeeg gevuld met chocolade", "Chocoladekoek", 2.0m },
                    { 7, "gluten, melk", 2, "Zacht gebak met kaneel en suiker", "Kaneelkoek", 2.25m },
                    { 8, "gluten, melk, noten", 2, "Zacht gebak met pecannoten en karamel", "Pecanotenkoek", 2.5m }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Extras");

            migrationBuilder.DropTable(
                name: "Producten");
        }
    }
}
