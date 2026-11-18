using System.ComponentModel.DataAnnotations;

namespace KoffieBar.API.Models;

public class RegistreerDto
{
    [Required]
    public string Naam { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Wachtwoord { get; set; } = string.Empty;
}