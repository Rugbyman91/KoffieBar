namespace KoffieBar.API.Models;

public record BestellingAanvraagDto(List<BestelregelAanvraagDto> Bestelregels);

public record BestelregelAanvraagDto(
    int ProductId,
    int Aantal,
    string? GrootteCode,
    List<int>? ExtraIds
);