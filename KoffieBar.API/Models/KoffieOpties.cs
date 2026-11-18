namespace KoffieBar.API.Models;

public static class KoffieOpties
{
    public static readonly List<KoffieGrootteDto> KoffieGroottes =
    [
        new("Small", "Small", 1m),
        new("Medium", "Medium", 1.25m),
        new("Large", "Large", 1.5m),
        new("ExtraLarge", "Extra large", 1.75m)
    ];

    public static readonly List<KoffieGrootteDto> EspressoGroottes =
    [
        new("Small", "Enkel", 1m),
        new("Medium", "Dubbel", 2m),
        new("Large", "Triple", 3m)
    ];
}