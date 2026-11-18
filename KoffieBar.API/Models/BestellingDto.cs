namespace KoffieBar.API.Models;

public record BestellingDto(
    int Id,
    DateTime BesteldOp,
    string Status,
    decimal OorspronkelijkePrijs,
    decimal Korting,
    decimal SubTotaal,
    decimal Afronding,
    decimal Totaal,
    List<BestelregelDto> Bestelregels);

public record BestelregelDto(
    int ProductId,
    string ProductNaam,
    int Aantal,
    string? GrootteCode,
    List<string> Extras,
    decimal Eenheidsprijs,
    int AantalMetKorting,
    decimal Subtotaal
);