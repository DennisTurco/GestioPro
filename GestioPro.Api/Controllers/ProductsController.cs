using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/products")]
public class ProductsController(IProductService productService) : ControllerBase
{
    /// <summary>
    /// Return all products
    /// </summary>
    /// <returns>Complete list of products</returns>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await productService.GetAllAsync();
        return Ok(result);
    }

    /// <summary>
    /// Returns a product by ID
    /// </summary>
    /// <param name="id">Product ID</param>
    /// <returns>The requested product</returns>
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var result = await productService.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Create a new product
    /// </summary>
    /// <param name="dto">Product information</param>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProductRequestDTO dto)
    {
        var created = await productService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Update a product
    /// </summary>
    /// <param name="id">Product ID</param>
    /// <param name="dto">Product information</param>
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] ProductRequestDTO dto)
    {
        var updated = await productService.UpdateAsync(id, dto);

        if (updated is null)
            return NotFound();

        return Ok(updated);
    }

    /// <summary>
    /// Delete a product
    /// </summary>
    /// <param name="id">Product ID</param>
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        await productService.DeleteAsync(id);
        return NoContent();
    }
}
