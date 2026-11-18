using KoffieBar.API.Data;
using KoffieBar.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KoffieBar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly KoffieContext _context;

    public MenuController(KoffieContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<MenuDto>> GetMenu()
    {
        var producten = await _context.Producten.AsNoTracking().OrderBy(p => p.Id).ToListAsync();
        var extras = await _context.Extras.AsNoTracking().OrderBy(e => e.Id).ToListAsync();

        return new MenuDto(
            producten.Where(p => p.Categorie == Categorie.Koffie).ToList(),
            producten.Where(p => p.Categorie == Categorie.Gebak).ToList(),
            extras,
            KoffieOpties.KoffieGroottes,
            KoffieOpties.EspressoGroottes);
    }
}