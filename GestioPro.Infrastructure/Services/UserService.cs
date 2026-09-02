using GestioPro.Infrastructure.Data;
using GestioPro.Common.DTOs;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Helpers;
using GestioPro.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using GestioPro.Common.Models;

namespace GestioPro.Infrastructure.Services;

public class UserService(AppDbContext context, IAuditService auditService) : IUserService
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
            Password = PasswordHasher.Hash(dto.Password),
            Name = dto.Name,
            Surname = dto.Surname,
            CreatedDate = now,
            LastUpdateDate = now
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        await auditService.LogAsync("Create", nameof(User), user.Id.ToString(), newValues: MapToDto(user));
    }

    public async Task<UserResponseDTO> UpdateForceAsync(Guid id, UserRequestDTO dto)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new KeyNotFoundException("Utente non trovato");

        var oldValues = MapToDto(user);

        user.UserRole = dto.UserRole;
        user.Username = dto.Username;
        user.Email = dto.Email;
        user.Name = dto.Name;
        user.Surname = dto.Surname;
        user.IsDisabled = dto.IsDisabled;
        user.LastUpdateDate = DateTimeOffset.UtcNow;
        if (!string.IsNullOrWhiteSpace(dto.Password))
            user.Password = PasswordHasher.Hash(dto.Password);

        await context.SaveChangesAsync();

        var newValues = MapToDto(user);

        await auditService.LogAsync("Update", nameof(User), user.Id.ToString(), oldValues, newValues);

        return newValues;
    }

    public async Task<UserResponseDTO> UpdateAsync(Guid id, UserUpdateDTO dto)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new KeyNotFoundException("Utente non trovato");

        if (user.IsDisabled)
            throw new BusinessException("L'utente è stato disattivato da uno degli amministratori");

        var oldValues = MapToDto(user);

        user.Username = dto.Username;
        user.Email = dto.Email;
        user.Name = dto.Name;
        user.Surname = dto.Surname;
        user.LastUpdateDate = DateTimeOffset.UtcNow;

        await context.SaveChangesAsync();

        var newValues = MapToDto(user);

        await auditService.LogAsync("Update", nameof(User), user.Id.ToString(), oldValues, newValues);

        return newValues;
    }


    public async Task<UserResponseDTO> UpdatePasswordAsync(Guid id, string oldPassword, string newPassword)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new KeyNotFoundException("Utente non trovato");

        if (user.IsDisabled)
            throw new BusinessException("Impossibile aggiornare la password, l'utente è stato disattivato da uno degli amministratori");

        if (!PasswordHasher.Verify(oldPassword, user.Password))
            throw new BusinessException("La password vecchia non è corretta, impossibile aggiornare");

        if (string.IsNullOrWhiteSpace(newPassword))
            throw new BusinessException("La nuova password è vuota, impossibile aggiornare");

        var oldValues = MapToDto(user);

        user.Password = PasswordHasher.Hash(newPassword);
        user.LastUpdateDate = DateTimeOffset.UtcNow;

        await context.SaveChangesAsync();

        var newValues = MapToDto(user);

        await auditService.LogAsync("Update", nameof(User), user.Id.ToString(), oldValues, newValues);

        return newValues;
    }

    public async Task<UserResponseDTO> UpdatePasswordForcedAsync(Guid id, string password)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new KeyNotFoundException("Utente non trovato");

        if (user.IsDisabled)
            throw new BusinessException("Impossibile aggiornare la password, l'utente è stato disattivato da uno degli amministratori");

        if (string.IsNullOrWhiteSpace(password))
            throw new BusinessException("La nuova password è vuota, impossibile aggiornare");

        var oldValues = MapToDto(user);

        user.Password = PasswordHasher.Hash(password);
        user.LastUpdateDate = DateTimeOffset.UtcNow;

        await context.SaveChangesAsync();

        var newValues = MapToDto(user);

        await auditService.LogAsync("Update", nameof(User), user.Id.ToString(), oldValues, newValues);

        return newValues;
    }

    public async Task DeleteAsync(Guid id)
    {
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new BusinessException("Utente non trovato");

        var oldValues = MapToDto(user);

        user.IsDisabled = true;
        user.LastUpdateDate = DateTimeOffset.UtcNow;

        await context.SaveChangesAsync();

        var newValues = MapToDto(user);
        await auditService.LogAsync("Delete", nameof(User), user.Id.ToString(), oldValues, newValues);
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
