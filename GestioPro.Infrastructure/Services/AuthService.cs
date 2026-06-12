using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using GestioPro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace GestioPro.Infrastructure.Services;

public class AuthService(AppDbContext context, IConfiguration config) : IAuthService
{
    public async Task<LoginResponseDTO?> LoginAsync(LoginRequestDTO dto)
    {
        var hash = HashPassword(dto.Password);

        var user = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Username == dto.Username && u.Password == hash);

        if (user is null) return null;

        var token = GenerateToken(user.Id, user.Username);

        var userDto = new UserResponseDTO(user.Id, user.Username, user.Email, user.Name, user.Surname, user.CreatedDate);
        return new LoginResponseDTO(token, userDto);
    }

    private string GenerateToken(Guid userId, string username)
    {
        var secret = config["Jwt:Secret"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddHours(double.Parse(config["Jwt:ExpiresInHours"]!));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Name, username),
        };

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes).ToLower();
    }
}
