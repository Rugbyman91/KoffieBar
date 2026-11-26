using System.Text.Json;

namespace KoffieBar.API.Tests;

public class MenuIntegrationTests : IClassFixture<ApiWebApplicationFactory>
{
    private readonly ApiWebApplicationFactory _factory;

    public MenuIntegrationTests(ApiWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetMenu_GeeftProductenExtrasEnFormatenTerug()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/menu");

        response.EnsureSuccessStatusCode();

        using var document = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync());

        var menu = document.RootElement;

        Assert.Equal(4, menu.GetProperty("coffees").GetArrayLength());
        Assert.Equal(4, menu.GetProperty("pastries").GetArrayLength());
        Assert.Equal(4, menu.GetProperty("extras").GetArrayLength());
        Assert.Equal(4, menu.GetProperty("coffeeSizes").GetArrayLength());
        Assert.Equal(3, menu.GetProperty("espressoSizes").GetArrayLength());

        Assert.Equal(
            "Americano",
            menu.GetProperty("coffees")[0].GetProperty("name").GetString());

        Assert.Equal(
            "Croissant",
            menu.GetProperty("pastries")[0].GetProperty("name").GetString());
    }
}