using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/quotations")]
public class QuotationsController(IQuotationService quotationService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        // TODO
        throw new NotImplementedException();
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        // TODO
        throw new NotImplementedException();
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] QuotationRequestDTO dto)
    {
        // TODO
        throw new NotImplementedException();
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] QuotationRequestDTO dto)
    {
        // TODO
        throw new NotImplementedException();
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        // TODO
        throw new NotImplementedException();
    }
}
