using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/users")]
public class UsersController(IUserService userService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        // TODO
        throw new NotImplementedException();
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        // TODO
        throw new NotImplementedException();
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UserRequestDTO dto)
    {
        // TODO
        throw new NotImplementedException();
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UserRequestDTO dto)
    {
        // TODO
        throw new NotImplementedException();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        // TODO
        throw new NotImplementedException();
    }
}
