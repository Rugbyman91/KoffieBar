using KoffieBar.API.Data;
using KoffieBar.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;

namespace KoffieBar.API
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
                };
            });

            builder.Services.AddAuthorization();

            builder.Services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    Description = "Voer je JWT-token in."
                });

                options.AddSecurityRequirement(document =>
                    new OpenApiSecurityRequirement
                    {
                        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
                    });
            });

            builder.Services.AddControllers();

            builder.Services.AddDbContext<KoffieContext>(options =>
                options.UseSqlite(builder.Configuration.GetConnectionString("Koffie")));
            builder.Services.AddIdentityCore<Klant>(options =>
            {
                options.User.RequireUniqueEmail = true;
            }).AddEntityFrameworkStores<KoffieContext>();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AngularClient", policy =>
                {
                    policy
                        .WithOrigins("http://localhost:4200")
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            });

            var app = builder.Build();
            var jwtKey = app.Configuration["Jwt:Key"];

            if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
            {
                throw new InvalidOperationException(
                    "Jwt:Key ontbreekt of is korter dan 32 tekens. " +
                    "Start de API in Development (dotnet run) of zet de omgevingsvariabele Jwt__Key.");
            }

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            using (var scope = app.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<KoffieContext>();

                // Database migreren in elke omgeving.
                await context.Database.MigrateAsync();

                // Alleen in Development een demoaccount aanmaken.
                if (app.Environment.IsDevelopment())
                {
                    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<Klant>>();

                    if (await userManager.FindByEmailAsync("test@test.be") is null)
                    {
                        var testKlant = new Klant
                        {
                            Naam = "Test Klant",
                            Email = "test@test.be",
                            UserName = "test@test.be"
                        };

                        var resultaat = await userManager.CreateAsync(testKlant, "Test123!");

                        if (!resultaat.Succeeded)
                        {
                            app.Logger.LogError(
                                "Demoaccount kon niet worden aangemaakt: {Errors}",
                                string.Join(", ", resultaat.Errors.Select(error => error.Description)));
                        }
                    }
                }
            }

            // Configure the HTTP request pipeline.

            if (!app.Environment.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }

            app.UseCors("AngularClient");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }
    }
}