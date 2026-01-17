using Microsoft.AspNetCore.Mvc;
using ZidoyVelg.Api.Models;
using ZidoyVelg.Api.Services;

namespace ZidoyVelg.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto request)
    {
        var user = new User
        {
            Username = request.Username,
            Name = request.Name,
            Email = request.Email,
            Address = request.Address,
            Role = request.Username.ToLower().StartsWith("admin") ? "admin" : "customer"
        };

        var result = await _authService.RegisterAsync(user, request.Password);
        if (result == null)
            return BadRequest(new { message = "Email already in use" });

        return Ok(new { message = "User registered successfully" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto request)
    {
        var token = await _authService.LoginAsync(request.Email, request.Password);
        if (token == null)
            return Unauthorized(new { message = "Invalid email or password" });

        return Ok(new { token });
    }
}

public class RegisterDto
{
    public string Username { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string? Address { get; set; }
    public string? Role { get; set; }
}

public class LoginDto
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}
