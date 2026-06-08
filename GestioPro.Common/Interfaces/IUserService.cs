using GestioPro.Common.DTOs;

namespace GestioPro.Common.Interfaces;

public interface IUserService
{
    Task<List<UserResponseDTO>> GetAllAsync();
    Task<UserResponseDTO?> GetByIdAsync(Guid id);
    Task CreateAsync(UserRequestDTO dto);
    Task<UserResponseDTO> UpdateAsync(Guid id, UserRequestDTO dto);
    Task DeleteAsync(Guid id);
}
