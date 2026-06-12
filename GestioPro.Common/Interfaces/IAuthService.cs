using GestioPro.Common.DTOs;

namespace GestioPro.Common.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDTO?> LoginAsync(LoginRequestDTO dto);
}
