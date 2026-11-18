using Microsoft.AspNetCore.Identity;

namespace KoffieBar.API.Models;

public class Klant : IdentityUser
{
    public string Naam { get; set; } = string.Empty;
}