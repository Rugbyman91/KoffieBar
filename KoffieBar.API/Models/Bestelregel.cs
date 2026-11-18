namespace KoffieBar.API.Models;

public class Bestelregel
{
    public int Id { get; set; }

    public int BestellingId { get; set; }
    public Bestelling Bestelling { get; set; } = null!;

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int Aantal { get; set; }
    public string? GrootteCode { get; set; }
    public decimal Eenheidsprijs { get; set; }
    public List<BestelregelExtra> Extras { get; set; } = [];
    public int AantalMetKorting { get; set; }
}