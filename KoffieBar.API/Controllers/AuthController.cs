using KoffieBar.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace KoffieBar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<Klant> _userManager;
    private readonly IConfiguration _config;

    public AuthController(UserManager<Klant> userManager, IConfiguration config)
    {
        _userManager = userManager;
        _config = config;
    }

    [HttpPost("registreer")]
    public async Task<IActionResult> Registreer(RegistreerDto dto)
    {
        var klant = new Klant
        {
            Naam = dto.Naam,
            Email = dto.Email,
            UserName = dto.Email
        };

        var resultaat = await _userManager.CreateAsync(klant, dto.Wachtwoord);

        if (!resultaat.Succeeded)
        {
            return BadRequest(resultaat.Errors.Select(e => e.Description));
        }

        return Ok(new { klant.Id, klant.Naam, klant.Email });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var klant = await _userManager.FindByEmailAsync(dto.Email);

        if (klant is null || !await _userManager.CheckPasswordAsync(klant, dto.Wachtwoord))
        {
            return Unauthorized("Ongeldig e-mailadres of wachtwoord.");
        }

        var claims = new List<Claim>
    {
        new(ClaimTypes.NameIdentifier, klant.Id),
        new(ClaimTypes.Email, klant.Email!),
        new(ClaimTypes.Name, klant.Naam)
    };

        var sleutel = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var handtekening = new SigningCredentials(sleutel, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpiresMinutes"]!)),
            signingCredentials: handtekening);

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new { token = jwt, klant.Naam, klant.Email });
    }
}