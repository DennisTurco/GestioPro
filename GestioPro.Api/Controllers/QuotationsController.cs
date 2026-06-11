using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/quotations")]
public class QuotationsController(IQuotationService quotationService) : ControllerBase
{
    /// <summary>
    /// Return all quotations
    /// </summary>
    /// <returns>Complete list of quotations</returns>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await quotationService.GetAllAsync();
        return Ok(result);
    }

    /// <summary>
    /// Returns a quotation by ID
    /// </summary>
    /// <param name="id">Quotation ID</param>
    /// <returns>The requested quotation</returns>
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var result = quotationService.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Create a new quotation
    /// </summary>
    /// <param name="dto">Quotation information</param>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] QuotationRequestDTO dto)
    {
        await quotationService.CreateAsync(dto);
        return StatusCode(StatusCodes.Status201Created);
    }

    /// <summary>
    /// Update a quotation
    /// </summary>
    /// <param name="id">Quotation ID</param>
    /// <param name="dto">Quotation information</param>
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] QuotationRequestDTO dto)
    {
        var updated = await quotationService.UpdateAsync(id, dto);

        if (updated is null)
            return NotFound();

        return Ok(updated);
    }

    /// <summary>
    /// Delete a quotation
    /// </summary>
    /// <param name="id">Quotation ID</param>
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        await quotationService.DeleteAsync(id);
        return NoContent();
    }
}
