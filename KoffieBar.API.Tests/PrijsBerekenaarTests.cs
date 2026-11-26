using KoffieBar.API.Models;
using KoffieBar.API.Services;
using Xunit;

namespace KoffieBar.API.Tests;

public class PrijsBerekenaarTests
{
    private static Bestelregel KoffieRegel(decimal eenheidsprijs, int aantal = 1) =>
        MaakRegel(Categorie.Koffie, eenheidsprijs, aantal);

    private static Bestelregel GebakRegel(decimal eenheidsprijs, int aantal = 1) =>
        MaakRegel(Categorie.Gebak, eenheidsprijs, aantal);

    private static Bestelregel MaakRegel(Categorie categorie, decimal eenheidsprijs, int aantal) =>
        new()
        {
            Product = new Product { Categorie = categorie },
            Eenheidsprijs = eenheidsprijs,
            Aantal = aantal
        };

    private static decimal TotaalVan(List<Bestelregel> regels) =>
        regels.Sum(r => PrijsBerekenaar.Subtotaal(r));

    // De drie bestellingen die eerder handmatig geverifieerd zijn

    [Fact]
    public void Een_espresso_en_een_croissant_geven_2_92_en_na_afronding_2_90()
    {
        var espresso = KoffieRegel(1.50m);
        var croissant = GebakRegel(1.75m);
        var regels = new List<Bestelregel> { espresso, croissant };

        PrijsBerekenaar.PasKortingToe(regels);

        Assert.Equal(1, espresso.AantalMetKorting);
        Assert.Equal(1, croissant.AantalMetKorting);
        Assert.Equal(1.35m, PrijsBerekenaar.Subtotaal(espresso));
        Assert.Equal(1.57m, PrijsBerekenaar.Subtotaal(croissant));
        Assert.Equal(2.92m, TotaalVan(regels));
        Assert.Equal(2.90m, PrijsBerekenaar.RondAfOpVijfCent(TotaalVan(regels)));
    }

    [Fact]
    public void Drie_koffies_en_twee_gebakjes_geven_9_52_en_na_afronding_9_50()
    {
        var cappuccino = KoffieRegel(3.00m);
        var espresso = KoffieRegel(1.50m);
        var americano = KoffieRegel(2.00m);
        var croissant = GebakRegel(1.75m);
        var chocoladekoek = GebakRegel(2.00m);
        // Bewust niet gesorteerd op prijs
        var regels = new List<Bestelregel>
        {
            cappuccino, croissant, espresso, chocoladekoek, americano
        };

        PrijsBerekenaar.PasKortingToe(regels);

        Assert.Equal(0, cappuccino.AantalMetKorting);
        Assert.Equal(1, espresso.AantalMetKorting);
        Assert.Equal(1, americano.AantalMetKorting);
        Assert.Equal(1, croissant.AantalMetKorting);
        Assert.Equal(1, chocoladekoek.AantalMetKorting);
        Assert.Equal(9.52m, TotaalVan(regels));
        Assert.Equal(9.50m, PrijsBerekenaar.RondAfOpVijfCent(TotaalVan(regels)));
    }

    [Fact]
    public void Twee_espresso_en_een_croissant_geven_4_42_en_na_afronding_4_40()
    {
        var espresso = KoffieRegel(1.50m, aantal: 2);
        var croissant = GebakRegel(1.75m);
        var regels = new List<Bestelregel> { espresso, croissant };

        PrijsBerekenaar.PasKortingToe(regels);

        Assert.Equal(1, espresso.AantalMetKorting);
        Assert.Equal(1, croissant.AantalMetKorting);
        Assert.Equal(2.85m, PrijsBerekenaar.Subtotaal(espresso));
        Assert.Equal(4.42m, TotaalVan(regels));
        Assert.Equal(4.40m, PrijsBerekenaar.RondAfOpVijfCent(TotaalVan(regels)));
    }

    // Randgevallen van de kortingsregel

    [Fact]
    public void Alleen_koffie_geeft_geen_korting()
    {
        var regels = new List<Bestelregel> { KoffieRegel(2.00m, 3), KoffieRegel(3.00m) };

        PrijsBerekenaar.PasKortingToe(regels);

        Assert.All(regels, r => Assert.Equal(0, r.AantalMetKorting));
        Assert.Equal(9.00m, TotaalVan(regels));
    }

    [Fact]
    public void Alleen_gebak_geeft_geen_korting()
    {
        var regels = new List<Bestelregel> { GebakRegel(1.75m, 2) };

        PrijsBerekenaar.PasKortingToe(regels);

        Assert.Equal(0, regels[0].AantalMetKorting);
        Assert.Equal(3.50m, TotaalVan(regels));
    }

    [Fact]
    public void Een_lege_lijst_geeft_geen_fout()
    {
        var fout = Record.Exception(() => PrijsBerekenaar.PasKortingToe(new List<Bestelregel>()));

        Assert.Null(fout);
    }

    [Fact]
    public void Bij_meer_gebak_dan_koffie_krijgt_enkel_het_goedkoopste_gebak_korting()
    {
        var koffie = KoffieRegel(3.00m);
        var duur = GebakRegel(2.25m);
        var goedkoop = GebakRegel(1.75m);
        var middel = GebakRegel(2.00m);
        var regels = new List<Bestelregel> { duur, koffie, goedkoop, middel };

        PrijsBerekenaar.PasKortingToe(regels);

        Assert.Equal(1, koffie.AantalMetKorting);
        Assert.Equal(1, goedkoop.AantalMetKorting);
        Assert.Equal(0, middel.AantalMetKorting);
        Assert.Equal(0, duur.AantalMetKorting);
    }

    [Fact]
    public void De_korting_loopt_over_meerdere_regels_van_hetzelfde_soort()
    {
        var koffie = KoffieRegel(3.00m, 3);
        var goedkoopGebak = GebakRegel(1.75m, 2);
        var duurderGebak = GebakRegel(2.00m, 2);
        var regels = new List<Bestelregel> { duurderGebak, koffie, goedkoopGebak };

        PrijsBerekenaar.PasKortingToe(regels);

        Assert.Equal(3, koffie.AantalMetKorting);
        Assert.Equal(2, goedkoopGebak.AantalMetKorting);
        Assert.Equal(1, duurderGebak.AantalMetKorting);
    }

    [Fact]
    public void Bij_gelijke_prijzen_krijgt_precies_het_juiste_aantal_stuks_korting()
    {
        var koffie1 = KoffieRegel(2.00m);
        var koffie2 = KoffieRegel(2.00m);
        var gebak = GebakRegel(1.75m);
        var regels = new List<Bestelregel> { koffie1, koffie2, gebak };

        PrijsBerekenaar.PasKortingToe(regels);

        Assert.Equal(1, koffie1.AantalMetKorting + koffie2.AantalMetKorting);
        Assert.Equal(5.37m, TotaalVan(regels));
    }

    [Fact]
    public void Opnieuw_berekenen_geeft_hetzelfde_resultaat()
    {
        var regels = new List<Bestelregel>
        {
            KoffieRegel(3.00m), GebakRegel(1.75m), KoffieRegel(1.50m),
            GebakRegel(2.00m), KoffieRegel(2.00m)
        };

        PrijsBerekenaar.PasKortingToe(regels);
        var eerste = regels.Select(r => r.AantalMetKorting).ToList();
        PrijsBerekenaar.PasKortingToe(regels);
        var tweede = regels.Select(r => r.AantalMetKorting).ToList();

        Assert.Equal(eerste, tweede);
    }

    [Fact]
    public void Opnieuw_berekenen_overschrijft_oude_waarden()
    {
        var koffie = KoffieRegel(2.00m);
        koffie.AantalMetKorting = 1;

        PrijsBerekenaar.PasKortingToe(new List<Bestelregel> { koffie });

        Assert.Equal(0, koffie.AantalMetKorting);
    }

    // Korting per stuk

    public static TheoryData<decimal, decimal> KortingGevallen => new()
    {
        { 0m, 0m },
        { 1.50m, 0.15m },
        { 1.75m, 0.18m },   // 0,175 rondt naar boven
        { 2.00m, 0.20m },
        { 2.25m, 0.23m },   // 0,225 rondt naar boven
        { 3.00m, 0.30m },
    };

    [Theory]
    [MemberData(nameof(KortingGevallen))]
    public void Korting_per_stuk_is_10_procent_afgerond_op_de_cent(decimal prijs, decimal verwacht)
    {
        Assert.Equal(verwacht, PrijsBerekenaar.KortingPerStuk(prijs));
    }

    // Afronden op 5 cent

    public static TheoryData<decimal, decimal> VijfCentGevallen => new()
    {
        { 0m, 0m },
        { 0.02m, 0m },
        { 0.03m, 0.05m },
        { 2.90m, 2.90m },
        { 2.91m, 2.90m },
        { 2.92m, 2.90m },
        { 2.93m, 2.95m },
        { 2.94m, 2.95m },
        { 2.95m, 2.95m },
        { 2.96m, 2.95m },
        { 2.97m, 2.95m },
        { 2.98m, 3.00m },
        { 2.99m, 3.00m },
        { 4.42m, 4.40m },
        { 9.52m, 9.50m },
    };

    [Theory]
    [MemberData(nameof(VijfCentGevallen))]
    public void Afronden_op_vijf_cent_volgt_de_regel_1_2_6_7_omlaag_en_3_4_8_9_omhoog(
        decimal bedrag, decimal verwacht)
    {
        Assert.Equal(verwacht, PrijsBerekenaar.RondAfOpVijfCent(bedrag));
    }
}