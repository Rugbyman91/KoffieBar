using KoffieBar.API.Models;

namespace KoffieBar.API.Services;

public static class PrijsBerekenaar
{
    public const decimal KortingPercentage = 0.10m;

    public static decimal KortingPerStuk(decimal eenheidsprijs) =>
        Math.Round(
            eenheidsprijs * KortingPercentage,
            2,
            MidpointRounding.AwayFromZero);

    public static decimal Subtotaal(Bestelregel regel) =>
        regel.Eenheidsprijs * regel.Aantal -
        KortingPerStuk(regel.Eenheidsprijs) * regel.AantalMetKorting;

    public static void PasKortingToe(List<Bestelregel> regels)
    {
        var aantalKoffies = TelStuks(regels, Categorie.Koffie);
        var aantalGebakjes = TelStuks(regels, Categorie.Gebak);
        var aantalKortingen = Math.Min(aantalKoffies, aantalGebakjes);

        VerdeelKorting(regels, Categorie.Koffie, aantalKortingen);
        VerdeelKorting(regels, Categorie.Gebak, aantalKortingen);
    }

    private static int TelStuks(List<Bestelregel> regels, Categorie categorie) =>
        regels
            .Where(r => r.Product.Categorie == categorie)
            .Sum(r => r.Aantal);

    private static void VerdeelKorting(
        List<Bestelregel> regels,
        Categorie categorie,
        int aantalKortingen)
    {
        var resterend = aantalKortingen;

        foreach (var regel in regels
            .Where(r => r.Product.Categorie == categorie)
            .OrderBy(r => r.Eenheidsprijs))
        {
            regel.AantalMetKorting = Math.Min(regel.Aantal, resterend);
            resterend -= regel.AantalMetKorting;
        }
    }

    //Rond alle prijzen af op 5 cent
    public static decimal RondAfOpVijfCent(decimal bedrag) => Math.Round(bedrag * 20m, 0, MidpointRounding.AwayFromZero) / 20m;
}