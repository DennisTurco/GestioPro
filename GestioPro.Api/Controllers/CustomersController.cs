using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/customers")]
public class CustomersController(ICustomerService customerService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        // TODO: chiama il servizio e restituisci Ok(result)
        throw new NotImplementedException();
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        // TODO: chiama il servizio; se null restituisci NotFound(), altrimenti Ok(result)
        throw new NotImplementedException();
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CustomerRequestDTO dto)
    {
        // TODO: chiama il servizio e restituisci StatusCode(201)
        throw new NotImplementedException();
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] CustomerRequestDTO dto)
    {
        // TODO: chiama il servizio e restituisci Ok(result)
        throw new NotImplementedException();
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        // TODO: chiama il servizio e restituisci NoContent()
        throw new NotImplementedException();
    }
}
