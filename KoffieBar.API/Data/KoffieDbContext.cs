using KoffieBar.API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace KoffieBar.API.Data;

public class KoffieContext : IdentityDbContext<Klant>
{
    public KoffieContext(DbContextOptions<KoffieContext> options)
        : base(options)
    {
    }

    public DbSet<Product> Producten { get; set; }
    public DbSet<Extra> Extras { get; set; }
    public DbSet<Bestelling> Bestellingen { get; set; }
    public DbSet<Bestelregel> Bestelregels { get; set; }
    public DbSet<BestelregelExtra> BestelregelExtras { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<BestelregelExtra>().HasKey(be => new { be.BestelregelId, be.ExtraId });
        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Americano", Description = "Espresso aangelengd met heet water", Allergies = "geen", Price = 2.0m, Categorie = Categorie.Koffie },
            new Product{Id = 2, Name = "Espresso", Description = "Een kleine, krachtige shot koffie", Allergies = "geen", Price = 1.5m, Categorie = Categorie.Koffie, IsEspresso = true},
            new Product { Id = 3, Name = "Cappuccino", Description = "Espresso met warme melk en een dikke schuimlaag", Allergies = "melk", Price = 3.0m, Categorie = Categorie.Koffie },
            new Product { Id = 4, Name = "Latte", Description = "Espresso met veel warme melk en een dun laagje schuim", Allergies = "melk", Price = 3.0m, Categorie = Categorie.Koffie },
            new Product { Id = 5, Name = "Croissant", Description = "Boterig bladerdeeg in halvemaanvorm", Allergies = "gluten, melk", Price = 1.75m, Categorie = Categorie.Gebak },
            new Product { Id = 6, Name = "Chocoladekoek", Description = "Bladerdeeg gevuld met chocolade", Allergies = "gluten, melk", Price = 2.0m, Categorie = Categorie.Gebak },
            new Product { Id = 7, Name = "Kaneelkoek", Description = "Zacht gebak met kaneel en suiker", Allergies = "gluten, melk", Price = 2.25m, Categorie = Categorie.Gebak },
            new Product { Id = 8, Name = "Pecanotenkoek", Description = "Zacht gebak met pecannoten en karamel", Allergies = "gluten, melk, noten", Price = 2.5m, Categorie = Categorie.Gebak }
        );

        modelBuilder.Entity<Extra>().HasData(
            new Extra { Id = 1, Name = "Espresso", Price = 1.2m },
            new Extra { Id = 2, Name = "Melk", Price = 0.5m },
            new Extra { Id = 3, Name = "Suiker", Price = 0.5m },
            new Extra { Id = 4, Name = "Vegan melk", Price = 0.8m }
        );
    }
}