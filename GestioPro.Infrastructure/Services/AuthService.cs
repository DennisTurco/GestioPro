using GestioPro.Common.DTOs;
using GestioPro.Common.Enums;
using GestioPro.Common.Helpers;
using GestioPro.Common.Interfaces;
using GestioPro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GestioPro.Infrastructure.Services;

public class AuthService(AppDbContext context, IConfiguration config) : IAuthService
{
    public async Task<LoginResponseDTO?> LoginAsync(LoginRequestDTO dto)
    {
        // case-insensitive: PostgreSQL's default "=" is case-sensitive, and users
        // routinely get their username auto-capitalized by the OS/keyboard
        var usernameOrEmail = dto.Username.Trim();
        var user = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Username.Equals(usernameOrEmail.ToLower()) || u.Email.Equals(usernameOrEmail));

        if (user is null || !PasswordHasher.Verify(dto.Password, user.Password)) return null;

        var token = GenerateToken(user.Id, user.Username, user.UserRole);

        var userDto = new UserResponseDTO(user.Id, user.UserRole, user.Username, user.Email, user.Name, user.Surname, user.IsDisabled, user.CreatedDate, user.LastUpdateDate);
        return new LoginResponseDTO(token, userDto);
    }

    private string GenerateToken(Guid userId, string username, UserRole role)
    {
        var secret = config["Jwt:Secret"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddHours(double.Parse(config["Jwt:ExpiresInHours"]!));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, role.ToString())
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
}
