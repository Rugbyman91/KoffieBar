using KoffieBar.API;
using KoffieBar.API.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace KoffieBar.API.Tests;

public class ApiWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection =
        new("Data Source=:memory:");

    public ApiWebApplicationFactory()
    {
        _connection.Open();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureAppConfiguration((_, configuration) =>
        {
            configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "TestSigningKey_For_KoffieBar_IntegrationTests_123456",
                ["Jwt:Issuer"] = "KoffieBar.Tests",
                ["Jwt:Audience"] = "KoffieBar.Tests",
                ["Jwt:ExpiresMinutes"] = "60",
                ["Logging:LogLevel:Default"] = "Warning",
                ["Logging:LogLevel:Microsoft.EntityFrameworkCore"] = "Warning"
            });
        });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<KoffieContext>();
            services.RemoveAll<DbContextOptions<KoffieContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<KoffieContext>>();

            services.AddDbContext<KoffieContext>(options =>
                options.UseSqlite(_connection));
        });
    }

    protected override void Dispose(bool disposing)
    {

        base.Dispose(disposing);
        if (disposing)
        {
            _connection.Dispose();
        }
    }
}