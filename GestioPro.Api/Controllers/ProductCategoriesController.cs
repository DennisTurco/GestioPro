using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/product-categories")]
public class ProductCategoriesController(IProductCategoryService productCategoryService) : ControllerBase
{
    /// <summary>
    /// Return all product categories
    /// </summary>
    /// <returns>Complete list of product categories</returns>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await productCategoryService.GetAllAsync();
        return Ok(result);
    }

    /// <summary>
    /// Returns a product category by ID
    /// </summary>
    /// <param name="id">Product category ID</param>
    /// <returns>The requested product category</returns>
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var result = await productCategoryService.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Create a new product category
    /// </summary>
    /// <param name="dto">Product category information</param>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProductCategoryRequestDTO dto)
    {
        var created = await productCategoryService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Update a product category
    /// </summary>
    /// <param name="id">Product category ID</param>
    /// <param name="dto">Product category information</param>
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] ProductCategoryRequestDTO dto)
    {
        var updated = await productCategoryService.UpdateAsync(id, dto);

        if (updated is null)
            return NotFound();

        return Ok(updated);
    }

    /// <summary>
    /// Delete a product category
    /// </summary>
    /// <param name="id">Product category ID</param>
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        await productCategoryService.DeleteAsync(id);
        return NoContent();
    }
}
