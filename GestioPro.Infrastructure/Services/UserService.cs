using GestioPro.Infrastructure.Data;
using GestioPro.Common.DTOs;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GestioPro.Infrastructure.Services;

public class UserService(AppDbContext context) : IUserService
{
    // TODO: restituisci tutti gli utenti mappati su UserResponseDTO
    public async Task<List<UserResponseDTO>> GetAllAsync()
    {
        throw new NotImplementedException();
    }

    // TODO: trova per Guid, restituisci null se non trovato
    public async Task<UserResponseDTO?> GetByIdAsync(Guid id)
    {
        throw new NotImplementedException();
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

    // TODO: elimina per id
    public async Task DeleteAsync(Guid id)
    {
        throw new NotImplementedException();
    }
}
