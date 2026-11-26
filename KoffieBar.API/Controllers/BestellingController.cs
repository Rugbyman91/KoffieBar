
using System.Security.Claims;
using KoffieBar.API.Data;
using KoffieBar.API.Models;
using KoffieBar.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KoffieBar.API.Controllers;

[ApiController]
[Route("api/bestellingen")]
[Authorize]
public class BestellingController : ControllerBase
{
    private readonly KoffieContext _context;

    public BestellingController(KoffieContext context)
    {
        _context = context;
    }

    [HttpPost("berekening")]
    public async Task<IActionResult> BerekenBestelling(
    BestellingAanvraagDto aanvraag)
    {
        var (regels, fout) =
            await BerekenBestelregels(aanvraag.Bestelregels);

        if (fout is not null)
            return BadRequest(fout);

        var tijdelijkeBestelling = new Bestelling
        {
            Bestelregels = regels!
        };

        return Ok(NaarDto(tijdelijkeBestelling));
    }

    [HttpPost]
    public async Task<IActionResult> PlaatsBestelling(
        BestellingAanvraagDto aanvraag)
    {
        var klantId = HuidigeKlantId();

        if (klantId is null)
            return Unauthorized();

        var (regels, fout) =
            await BerekenBestelregels(aanvraag.Bestelregels);

        if (fout is not null)
            return BadRequest(fout);

        var bestelling = new Bestelling
        {
            KlantId = klantId,
            BesteldOp = DateTime.UtcNow,
            Bestelregels = regels!
        };

        _context.Bestellingen.Add(bestelling);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetBestelling),
            new { id = bestelling.Id },
            NaarDto(bestelling));
    }

    [HttpGet]
    public async Task<ActionResult<List<BestellingDto>>> GetBestellingen()
    {
        var klantId = HuidigeKlantId();

        if (klantId is null)
            return Unauthorized();

        var bestellingen = await _context.Bestellingen
            .AsNoTracking()
            .Where(b => b.KlantId == klantId)
            .Include(b => b.Bestelregels)
                .ThenInclude(r => r.Product)
            .Include(b => b.Bestelregels)
                .ThenInclude(r => r.Extras)
                    .ThenInclude(e => e.Extra)
            .OrderByDescending(b => b.BesteldOp)
            .ToListAsync();

        return Ok(bestellingen.Select(NaarDto).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BestellingDto>> GetBestelling(int id)
    {
        var klantId = HuidigeKlantId();

        if (klantId is null)
            return Unauthorized();

        var bestelling = await HaalBestellingOp(id);

        if (bestelling is null)
            return NotFound();

        if (bestelling.KlantId != klantId)
            return NotFound();

        return Ok(NaarDto(bestelling));
    }

    [HttpPatch("{id:int}/annuleren")]
    public async Task<IActionResult> AnnuleerBestelling(int id)
    {
        var klantId = HuidigeKlantId();

        if (klantId is null)
            return Unauthorized();

        var bestelling = await HaalBestellingOp(id);

        if (bestelling is null || bestelling.KlantId != klantId)
            return NotFound();

        if (DateTime.UtcNow >= bestelling.BesteldOp.AddMinutes(30))
        {
            return BadRequest(
                "Deze bestelling kan niet meer geannuleerd worden. " +
                "De annuleringstermijn van 30 minuten is verstreken.");
        }

        bestelling.Status = BestellingStatus.Geannuleerd;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    private string? HuidigeKlantId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
    }

    private async Task<Bestelling?> HaalBestellingOp(int id)
    {
        return await _context.Bestellingen
            .Include(b => b.Bestelregels)
                .ThenInclude(r => r.Product)
            .Include(b => b.Bestelregels)
                .ThenInclude(r => r.Extras)
                    .ThenInclude(e => e.Extra)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    private async Task<(
        List<Bestelregel>? Regels,
        string? Fout)> BerekenBestelregels(
            List<BestelregelAanvraagDto>? aanvragen)
    {
        if (aanvragen is null || aanvragen.Count == 0)
            return (null, "Een bestelling moet minstens één bestelregel bevatten.");

        if (aanvragen.Any(r => r.Aantal < 1 || r.Aantal > 100))
            return (null, "Het aantal moet tussen 1 en 100 liggen.");

        var productIds = aanvragen.Select(r => r.ProductId)
            .Distinct().ToList();

        var producten = await _context.Producten
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id);

        if (producten.Count != productIds.Count)
            return (null, "Een of meer producten bestaan niet.");

        if (aanvragen.Any(aanvraag =>
        {
            var ids = aanvraag.ExtraIds ?? [];
            return ids.Count != ids.Distinct().Count();
        }))
        {
            return (null, "Dezelfde extra mag niet dubbel gekozen worden.");
        }

        var alleExtraIds = aanvragen
            .SelectMany(r => r.ExtraIds ?? [])
            .Distinct()
            .ToList();

        var extraIds = alleExtraIds.Distinct().ToList();

        var extras = await _context.Extras
            .Where(e => extraIds.Contains(e.Id))
            .ToDictionaryAsync(e => e.Id);

        if (extras.Count != extraIds.Count)
            return (null, "Een of meer extra's bestaan niet.");

        var regels = new List<Bestelregel>();

        foreach (var aanvraag in aanvragen)
        {
            var product = producten[aanvraag.ProductId];
            var gekozenExtras = (aanvraag.ExtraIds ?? [])
                .Select(id => extras[id])
                .ToList();

            var isKoffie = product.Categorie == Categorie.Koffie;

            decimal factor = 1m;

            if (isKoffie)
            {
                if (string.IsNullOrWhiteSpace(aanvraag.GrootteCode))
                    return (null, "Kies een formaat voor elke koffie.");

                var groottes = product.IsEspresso
                    ? KoffieOpties.EspressoGroottes
                    : KoffieOpties.KoffieGroottes;

                var grootte = groottes.FirstOrDefault(
                    g => g.Code == aanvraag.GrootteCode);

                if (grootte is null)
                    return (null, "Ongeldig formaat voor " + product.Name + ".");

                factor = grootte.Factor;
            }
            else
            {
                if (aanvraag.GrootteCode is not null)
                    return (null, "Gebak heeft geen koffieformaat.");

                if (gekozenExtras.Count > 0)
                    return (null, "Extra's kunnen alleen bij koffie gekozen worden.");
            }

            var eenheidsprijs = Math.Round(
                product.Price * factor +
                gekozenExtras.Sum(e => e.Price),
                2,
                MidpointRounding.AwayFromZero);

            regels.Add(new Bestelregel
            {
                ProductId = product.Id,
                Product = product,
                Aantal = aanvraag.Aantal,
                GrootteCode = aanvraag.GrootteCode,
                Eenheidsprijs = eenheidsprijs,
                Extras = gekozenExtras.Select(e => new BestelregelExtra
                {
                    ExtraId = e.Id,
                    Extra = e
                }).ToList()
            });
        }

        PrijsBerekenaar.PasKortingToe(regels);

        return (regels, null);
    }

    private static BestellingDto NaarDto(Bestelling bestelling)
    {
        var regels = bestelling.Bestelregels.Select(r => new BestelregelDto(
            r.ProductId,
            r.Product.Name,
            r.Aantal,
            r.GrootteCode,
            r.Extras.Select(e => e.Extra.Name).ToList(),
            r.Eenheidsprijs,
            r.AantalMetKorting,
            PrijsBerekenaar.Subtotaal(r)
        )).ToList();

        var oorspronkelijkePrijs = regels.Sum(r =>
            r.Eenheidsprijs * r.Aantal);

        var subTotaal = regels.Sum(r => r.Subtotaal);

        var korting = oorspronkelijkePrijs - subTotaal;

        var totaal = PrijsBerekenaar.RondAfOpVijfCent(subTotaal);

        var afronding = totaal - subTotaal;

        return new BestellingDto(
            bestelling.Id,
            DateTime.SpecifyKind(bestelling.BesteldOp, DateTimeKind.Utc),
            bestelling.Status.ToString(),
            oorspronkelijkePrijs,
            korting,
            subTotaal,
            afronding,
            totaal,
            regels
        );
    }
}
