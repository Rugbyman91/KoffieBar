using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using KoffieBar.API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace KoffieBar.API.Tests;

public class BestellingIntegrationTests : IClassFixture<ApiWebApplicationFactory>
{
    private readonly ApiWebApplicationFactory _factory;

    public BestellingIntegrationTests(ApiWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private async Task<HttpClient> MaakIngelogdeClientAsync()
    {
        var client = _factory.CreateClient();
        var klant = await ApiTestHelpers.MaakKlantAsync(client);

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", klant.Token);

        return client;
    }

    private static object MaakEspressoEnCroissantAanvraag() => new
    {
        bestelregels = new[]
        {
            new
            {
                productId = 2,
                aantal = 1,
                grootteCode = "Small",
                extraIds = (int[]?)null
            },
            new
            {
                productId = 5,
                aantal = 1,
                grootteCode = (string?)null,
                extraIds = (int[]?)null
            }
        }
    };

    private static async Task<int> PlaatsTestBestellingAsync(HttpClient client)
    {
        var response = await client.PostAsJsonAsync(
            "/api/bestellingen",
            MaakEspressoEnCroissantAanvraag());

        response.EnsureSuccessStatusCode();

        using var document = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync());

        return document.RootElement.GetProperty("id").GetInt32();
    }

    [Fact]
    public async Task Berekening_EspressoEnCroissant_GeeftCorrectePrijs()
    {
        using var client = await MaakIngelogdeClientAsync();

        var response = await client.PostAsJsonAsync(
            "/api/bestellingen/berekening",
            MaakEspressoEnCroissantAanvraag());

        response.EnsureSuccessStatusCode();

        using var document = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync());

        var bestelling = document.RootElement;

        Assert.Equal(3.25m,
            bestelling.GetProperty("oorspronkelijkePrijs").GetDecimal());

        Assert.Equal(0.33m,
            bestelling.GetProperty("korting").GetDecimal());

        Assert.Equal(2.92m,
            bestelling.GetProperty("subTotaal").GetDecimal());

        Assert.Equal(-0.02m,
            bestelling.GetProperty("afronding").GetDecimal());

        Assert.Equal(2.90m,
            bestelling.GetProperty("totaal").GetDecimal());
    }

    [Fact]
    public async Task Bestellingen_ZonderToken_GeeftUnauthorized()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/bestellingen");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Berekening_ZonderBestelregels_GeeftBadRequest()
    {
        using var client = await MaakIngelogdeClientAsync();

        var response = await client.PostAsJsonAsync(
            "/api/bestellingen/berekening",
            new { bestelregels = Array.Empty<object>() });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Berekening_MetOnbestaandProduct_GeeftBadRequest()
    {
        using var client = await MaakIngelogdeClientAsync();

        var response = await client.PostAsJsonAsync(
            "/api/bestellingen/berekening",
            new
            {
                bestelregels = new[]
                {
                    new
                    {
                        productId = 9999,
                        aantal = 1,
                        grootteCode = "Small",
                        extraIds = (int[]?)null
                    }
                }
            });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Berekening_MetOngeldigAantal_GeeftBadRequest()
    {
        using var client = await MaakIngelogdeClientAsync();

        var response = await client.PostAsJsonAsync(
            "/api/bestellingen/berekening",
            new
            {
                bestelregels = new[]
                {
                    new
                    {
                        productId = 2,
                        aantal = 0,
                        grootteCode = "Small",
                        extraIds = (int[]?)null
                    }
                }
            });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Berekening_KoffieZonderFormaat_GeeftBadRequest()
    {
        using var client = await MaakIngelogdeClientAsync();

        var response = await client.PostAsJsonAsync(
            "/api/bestellingen/berekening",
            new
            {
                bestelregels = new[]
                {
                    new
                    {
                        productId = 2,
                        aantal = 1,
                        grootteCode = (string?)null,
                        extraIds = (int[]?)null
                    }
                }
            });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Berekening_MetDubbeleExtra_GeeftBadRequest()
    {
        using var client = await MaakIngelogdeClientAsync();

        var response = await client.PostAsJsonAsync(
            "/api/bestellingen/berekening",
            new
            {
                bestelregels = new[]
                {
                    new
                    {
                        productId = 2,
                        aantal = 1,
                        grootteCode = "Small",
                        extraIds = new[] { 1, 1 }
                    }
                }
            });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Plaatsen_OphalenEnAnnuleren_WerktCorrect()
    {
        using var client = await MaakIngelogdeClientAsync();

        var id = await PlaatsTestBestellingAsync(client);

        var lijstResponse = await client.GetAsync("/api/bestellingen");
        lijstResponse.EnsureSuccessStatusCode();

        using (var lijstDocument = JsonDocument.Parse(
            await lijstResponse.Content.ReadAsStringAsync()))
        {
            Assert.Contains(
                lijstDocument.RootElement.EnumerateArray(),
                bestelling => bestelling.GetProperty("id").GetInt32() == id);
        }

        var detailResponse = await client.GetAsync($"/api/bestellingen/{id}");
        detailResponse.EnsureSuccessStatusCode();

        var annuleerResponse = await client.PatchAsync(
            $"/api/bestellingen/{id}/annuleren",
            null);

        Assert.Equal(HttpStatusCode.NoContent, annuleerResponse.StatusCode);

        var bijgewerktResponse = await client.GetAsync($"/api/bestellingen/{id}");
        bijgewerktResponse.EnsureSuccessStatusCode();

        using var bijgewerktDocument = JsonDocument.Parse(
            await bijgewerktResponse.Content.ReadAsStringAsync());

        Assert.Equal(
            "Geannuleerd",
            bijgewerktDocument.RootElement.GetProperty("status").GetString());
    }

    [Fact]
    public async Task BestellingVanAndereKlant_GeeftNotFound()
    {
        using var eersteClient = await MaakIngelogdeClientAsync();
        using var tweedeClient = await MaakIngelogdeClientAsync();

        var id = await PlaatsTestBestellingAsync(eersteClient);

        var ophalen = await tweedeClient.GetAsync($"/api/bestellingen/{id}");

        var annuleren = await tweedeClient.PatchAsync(
            $"/api/bestellingen/{id}/annuleren",
            null);

        Assert.Equal(HttpStatusCode.NotFound, ophalen.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, annuleren.StatusCode);
    }

    [Fact]
    public async Task AnnulerenNaDertigMinuten_GeeftBadRequest()
    {
        using var client = await MaakIngelogdeClientAsync();

        var id = await PlaatsTestBestellingAsync(client);

        // De bestelling rechtstreeks in de testdatabase ouder maken.
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider
                .GetRequiredService<KoffieContext>();

            var bestelling = await context.Bestellingen
                .FirstAsync(b => b.Id == id);

            bestelling.BesteldOp = DateTime.UtcNow.AddMinutes(-31);

            await context.SaveChangesAsync();
        }

        var response = await client.PatchAsync(
            $"/api/bestellingen/{id}/annuleren",
            null);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}