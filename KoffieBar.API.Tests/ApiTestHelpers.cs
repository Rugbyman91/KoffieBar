using System.Net.Http.Json;
using System.Text.Json;

namespace KoffieBar.API.Tests;

public record TestKlant(string Email, string Token);

public static class ApiTestHelpers
{
    public static async Task<TestKlant> MaakKlantAsync(HttpClient client)
    {
        var email = $"test-{Guid.NewGuid():N}@example.be";

        var registratie = await client.PostAsJsonAsync(
            "/api/auth/registreer",
            new
            {
                naam = "Integratietest Klant",
                email,
                wachtwoord = "Test123!"
            });

        registratie.EnsureSuccessStatusCode();

        var login = await client.PostAsJsonAsync(
            "/api/auth/login",
            new
            {
                email,
                wachtwoord = "Test123!"
            });

        login.EnsureSuccessStatusCode();

        using var document = JsonDocument.Parse(
            await login.Content.ReadAsStringAsync());

        var token = document.RootElement
            .GetProperty("token")
            .GetString()!;

        return new TestKlant(email, token);
    }
}