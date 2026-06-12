using GestioPro.Infrastructure.Data;
using GestioPro.Common.DTOs;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using GestioPro.Common.Models;

namespace GestioPro.Infrastructure.Services;

public class UserService(AppDbContext context) : IUserService
{
    public async Task<List<UserResponseDTO>> GetAllAsync()
        => await context.Users
            .AsNoTracking()
            .Select(u => MapToDto(u))
            .ToListAsync();

    public async Task<UserResponseDTO?> GetByIdAsync(Guid id)
    {
        var user = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id);

        return user is null ? null : MapToDto(user);
    }

    public async Task CreateAsync(UserRequestDTO dto)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = dto.Username,
            Email = dto.Email,
            Password = AuthService.HashPassword(dto.Password),
            Name = dto.Name,
            Surname = dto.Surname,
            CreatedDate = DateTimeOffset.UtcNow,
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();
    }

    public async Task<UserResponseDTO> UpdateAsync(Guid id, UserRequestDTO dto)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new KeyNotFoundException("Utente non trovato");

        user.Username = dto.Username;
        user.Email = dto.Email;
        user.Name = dto.Name;
        user.Surname = dto.Surname;
        if (!string.IsNullOrWhiteSpace(dto.Password))
            user.Password = AuthService.HashPassword(dto.Password);

        await context.SaveChangesAsync();
        return MapToDto(user);
    }


    public async Task DeleteAsync(Guid id)
    {
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user is null)
            throw new BusinessException("Utente non trovato");

        context.Remove(user);
        await context.SaveChangesAsync();
    }

    private static UserResponseDTO MapToDto(User u)
        => new (
            u.Id,
            u.Username,
            u.Email,
            u.Name,
            u.Surname,
            u.CreatedDate
        );
}
