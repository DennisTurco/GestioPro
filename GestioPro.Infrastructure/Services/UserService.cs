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

    // TODO: imposta CreatedDate = DateOnly.FromDateTime(DateTime.UtcNow), hash della password, salva
    public async Task CreateAsync(UserRequestDTO dto)
    {
        throw new NotImplementedException();
    }

    // TODO: aggiorna i campi (attenzione alla password: ri-hasha solo se cambia), salva
    public async Task<UserResponseDTO> UpdateAsync(Guid id, UserRequestDTO dto)
    {
        throw new NotImplementedException();
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
