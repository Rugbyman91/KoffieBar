namespace KoffieBar.API.Models;

public class Bestelling
{
    public int Id { get; set; }

    public DateTime BesteldOp { get; set; } = DateTime.UtcNow;

    public BestellingStatus Status { get; set; } = BestellingStatus.Geplaatst;

    public string? KlantId { get; set; }
    public Klant? Klant { get; set; }

    public List<Bestelregel> Bestelregels { get; set; } = [];
}