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

    public async Task<UserResponseDTO?> LoginByIdAsync(Guid id)
    {
        var user = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user is null)
            return null;

        if (user.IsDisabled)
            throw new BusinessException("L'utente è stato disattivato. Se ritenuto un errore, si praga di contattare l'amministrazione");

        return MapToDto(user);
    }

    public async Task<UserResponseDTO?> GetByIdAsync(Guid id)
    {
        var user = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user is null)
            return null;

        return MapToDto(user);
    }

    public async Task CreateAsync(UserRequestDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Password))
            throw new BusinessException("La password è obbligatoria");

        DateTimeOffset now = DateTimeOffset.UtcNow;
        var user = new User
        {
            Id = Guid.NewGuid(),
            UserRole = dto.UserRole,
            Username = dto.Username,
            Email = dto.Email,
            Password = AuthService.HashPassword(dto.Password),
            Name = dto.Name,
            Surname = dto.Surname,
            CreatedDate = now,
            LastUpdateDate = now
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();
    }

    public async Task<UserResponseDTO> UpdateForceAsync(Guid id, UserRequestDTO dto)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new KeyNotFoundException("Utente non trovato");

        user.UserRole = dto.UserRole;
        user.Username = dto.Username;
        user.Email = dto.Email;
        user.Name = dto.Name;
        user.Surname = dto.Surname;
        user.IsDisabled = dto.IsDisabled;
        user.LastUpdateDate = DateTimeOffset.UtcNow;
        if (!string.IsNullOrWhiteSpace(dto.Password))
            user.Password = AuthService.HashPassword(dto.Password);

        await context.SaveChangesAsync();
        return MapToDto(user);
    }

    public async Task<UserResponseDTO> UpdateAsync(Guid id, UserUpdateDTO dto)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new KeyNotFoundException("Utente non trovato");

        if (user.IsDisabled)
            throw new BusinessException("L'utente è stato disattivato da uno degli amministratori");

        user.Username = dto.Username;
        user.Email = dto.Email;
        user.Name = dto.Name;
        user.Surname = dto.Surname;
        user.LastUpdateDate = DateTimeOffset.UtcNow;

        await context.SaveChangesAsync();
        return MapToDto(user);
    }


    public async Task<UserResponseDTO> UpdatePasswordAsync(Guid id, string oldPassword, string newPassword)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new KeyNotFoundException("Utente non trovato");

        if (user.IsDisabled)
            throw new BusinessException("Impossibile aggiornare la password, l'utente è stato disattivato da uno degli amministratori");

        if (!user.Password.Equals(AuthService.HashPassword(oldPassword)))
            throw new BusinessException("La password vecchia non è corretta, impossibile aggiornare");

        if (string.IsNullOrWhiteSpace(newPassword))
            throw new BusinessException("La nuova password è vuota, impossibile aggiornare");

        user.Password = AuthService.HashPassword(newPassword);
        user.LastUpdateDate = DateTimeOffset.UtcNow;

        await context.SaveChangesAsync();
        return MapToDto(user);
    }

    public async Task<UserResponseDTO> UpdatePasswordForcedAsync(Guid id, string password)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new KeyNotFoundException("Utente non trovato");

        if (user.IsDisabled)
            throw new BusinessException("Impossibile aggiornare la password, l'utente è stato disattivato da uno degli amministratori");

        if (string.IsNullOrWhiteSpace(password))
            throw new BusinessException("La nuova password è vuota, impossibile aggiornare");

        user.Password = AuthService.HashPassword(password);
        user.LastUpdateDate = DateTimeOffset.UtcNow;

        await context.SaveChangesAsync();
        return MapToDto(user);
    }

    public async Task DeleteAsync(Guid id)
    {
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user is null)
            throw new BusinessException("Utente non trovato");

        user.IsDisabled = true;
        user.LastUpdateDate = DateTimeOffset.UtcNow;

        await context.SaveChangesAsync();
    }

    private static UserResponseDTO MapToDto(User u)
        => new(
            u.Id,
            u.UserRole,
            u.Username,
            u.Email,
            u.Name,
            u.Surname,
            u.IsDisabled,
            u.CreatedDate,
            u.LastUpdateDate
        );
}
