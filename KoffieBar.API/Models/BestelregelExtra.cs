namespace KoffieBar.API.Models;

public class BestelregelExtra
{
    public int BestelregelId { get; set; }
    public Bestelregel Bestelregel { get; set; } = null!;

    public int ExtraId { get; set; }
    public Extra Extra { get; set; } = null!;
}