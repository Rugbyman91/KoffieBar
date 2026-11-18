using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace KoffieBar.API.Controllers
{

    [ApiController]
    [Route("api/account")]
    public class AccountController : ControllerBase
    {
        [HttpGet("me")]
        [Authorize]
        public IActionResult GetMijnAccount()
        {
            var klantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var email = User.FindFirstValue(ClaimTypes.Email);
            var naam = User.FindFirstValue(ClaimTypes.Name);

            return Ok(new
            {
                klantId,
                email,
                naam
            });
        }
    }
}
