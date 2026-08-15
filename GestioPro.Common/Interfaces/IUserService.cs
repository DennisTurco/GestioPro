using GestioPro.Common.DTOs;

namespace GestioPro.Common.Interfaces;

public interface IUserService
{
    Task<List<UserResponseDTO>> GetAllAsync();
    Task<UserResponseDTO?> GetByIdAsync(Guid id);
    Task CreateAsync(UserRequestDTO dto);
    Task<UserResponseDTO> UpdateForceAsync(Guid id, UserRequestDTO dto);
    Task<UserResponseDTO> UpdateAsync(Guid id, UserUpdateDTO dto);
    Task<UserResponseDTO> UpdatePasswordAsync(Guid id, string oldPassword, string newPassword);
    Task<UserResponseDTO> UpdatePasswordForcedAsync(Guid id, string password);
    Task DeleteAsync(Guid id);
}
