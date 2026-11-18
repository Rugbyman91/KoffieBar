namespace KoffieBar.API.Models;

public record MenuDto(
    List<Product> Coffees,
    List<Product> Pastries,
    List<Extra> Extras,
    List<KoffieGrootteDto> CoffeeSizes,
    List<KoffieGrootteDto> EspressoSizes);