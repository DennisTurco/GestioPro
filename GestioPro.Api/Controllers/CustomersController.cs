using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/customers")]
public class CustomersController(ICustomerService customerService) : ControllerBase
{
    /// <summary>
    /// Return all customers
    /// </summary>
    /// <returns>Complete list of customers</returns>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await customerService.GetAllAsync();
        return Ok(result);
    }

    /// <summary>
    /// Returns a customer by ID
    /// </summary>
    /// <param name="id">Customer ID</param>
    /// <returns>The requested customer</returns>
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var result = customerService.GetByIdAsync(id);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    /// <summary>
    /// Create a new customer
    /// </summary>
    /// <param name="dto">Customer information</param>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CustomerRequestDTO dto)
    {
        await customerService.CreateAsync(dto);
        return StatusCode(StatusCodes.Status201Created);
    }

    /// <summary>
    /// Update a customer
    /// </summary>
    /// <param name="id">Customer ID</param>
    /// <param name="dto">Customer information</param>
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] CustomerRequestDTO dto)
    {
        var updated = await customerService.UpdateAsync(id, dto);

        if (updated is null)
            return NotFound();

        return Ok(updated);
    }

    /// <summary>
    /// Delete a customer
    /// </summary>
    /// <param name="id">Customer ID</param>
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        await customerService.DeleteAsync(id);
        return NoContent();
    }
}
