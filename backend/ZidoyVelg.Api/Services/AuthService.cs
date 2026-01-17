using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using ZidoyVelg.Api.Models;

namespace ZidoyVelg.Api.Services;

public class JwtSettings
{
    public string Secret { get; set; } = null!;
}

public class AuthService
{
    private readonly IMongoCollection<User> _users;
    private readonly JwtSettings _jwtSettings;

    public AuthService(MongoDbService dbService, IOptions<JwtSettings> jwtSettings)
    {
        _users = dbService.Users;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<User?> RegisterAsync(User user, string password)
    {
        // Check if user exists
        var existingUser = await _users.Find(u => u.Email == user.Email).FirstOrDefaultAsync();
        if (existingUser != null) return null;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
        await _users.InsertOneAsync(user);
        return user;
    }

    public async Task<string?> LoginAsync(string email, string password)
    {
        var user = await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            return null;
        }

        return GenerateJwtToken(user);
    }

    private string GenerateJwtToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id!),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
