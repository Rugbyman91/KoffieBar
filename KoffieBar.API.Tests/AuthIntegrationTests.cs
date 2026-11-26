using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace KoffieBar.API.Tests;

public class AuthIntegrationTests : IClassFixture<ApiWebApplicationFactory>
{
    private readonly ApiWebApplicationFactory _factory;

    public AuthIntegrationTests(ApiWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Registreren_MaaktEenNieuweKlantAan()
    {
        using var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/registreer",
            new
            {
                naam = "Nieuwe Klant",
                email = $"nieuw-{Guid.NewGuid():N}@example.be",
                wachtwoord = "Test123!"
            });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Registreren_MetBestaandEmailadres_GeeftBadRequest()
    {
        using var client = _factory.CreateClient();

        var email = $"dubbel-{Guid.NewGuid():N}@example.be";

        var aanvraag = new
        {
            naam = "Dubbele Klant",
            email,
            wachtwoord = "Test123!"
        };

        var eerste = await client.PostAsJsonAsync(
            "/api/auth/registreer", aanvraag);

        var tweede = await client.PostAsJsonAsync(
            "/api/auth/registreer", aanvraag);

        Assert.Equal(HttpStatusCode.OK, eerste.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, tweede.StatusCode);
    }

    [Fact]
    public async Task Login_MetJuisteGegevens_GeeftJwtToken()
    {
        using var client = _factory.CreateClient();

        var klant = await ApiTestHelpers.MaakKlantAsync(client);

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new
            {
                email = klant.Email,
                wachtwoord = "Test123!"
            });

        response.EnsureSuccessStatusCode();

        using var document = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync());

        Assert.False(string.IsNullOrWhiteSpace(
            document.RootElement.GetProperty("token").GetString()));
    }

    [Fact]
    public async Task Login_MetFoutiefWachtwoord_GeeftUnauthorized()
    {
        using var client = _factory.CreateClient();

        var klant = await ApiTestHelpers.MaakKlantAsync(client);

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new
            {
                email = klant.Email,
                wachtwoord = "Verkeerd123!"
            });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AccountMe_ZonderToken_GeeftUnauthorized()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/account/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AccountMe_MetToken_GeeftDeIngelogdeKlant()
    {
        using var client = _factory.CreateClient();

        var klant = await ApiTestHelpers.MaakKlantAsync(client);

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", klant.Token);

        var response = await client.GetAsync("/api/account/me");

        response.EnsureSuccessStatusCode();

        using var document = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync());

        var account = document.RootElement;

        Assert.Equal(
            klant.Email,
            account.GetProperty("email").GetString());

        Assert.Equal(
            "Integratietest Klant",
            account.GetProperty("naam").GetString());

        Assert.False(string.IsNullOrWhiteSpace(
            account.GetProperty("klantId").GetString()));
    }
}