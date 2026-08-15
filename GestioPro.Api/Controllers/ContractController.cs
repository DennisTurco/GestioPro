using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/contracts")]
public class ContractController(IContractService contractService) : ControllerBase
{
    /// <summary>
    /// Return all contracts
    /// </summary>
    /// <returns>Complete list of contracts</returns>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await contractService.GetAllAsync();
        return Ok(result);
    }

    /// <summary>
    /// Returns a contract by ID
    /// </summary>
    /// <param name="id">Contract ID</param>
    /// <returns>The requested contract</returns>
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var result = contractService.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Create a new contract
    /// </summary>
    /// <param name="dto">Contract information</param>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ContractRequestDTO dto)
    {
        await contractService.CreateAsync(dto);
        return StatusCode(StatusCodes.Status201Created);
    }

    /// <summary>
    /// Update a contract
    /// </summary>
    /// <param name="id">Contract ID</param>
    /// <param name="dto">Contract information</param>
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] ContractRequestDTO dto)
    {
        var updated = await contractService.UpdateAsync(id, dto);

        if (updated is null)
            return NotFound();

        return Ok(updated);
    }

    /// <summary>
    /// Calculate next contract number
    /// </summary>
    [HttpGet("next-number")]
    public async Task<IActionResult> GetNextNumber(long quotationId, string quotationNumber)
    {
        var result = await contractService.CalculateNextNumberAsync(quotationId, quotationNumber);
        return Ok(result);
    }

    /// <summary>
    /// Renewal contract based on contract type
    /// </summary>
    [HttpGet("renewal")]
    public async Task<IActionResult> RenewalAsync(long contractId)
    {
        var result = await contractService.RenewalAsync(contractId);
        return Ok(result);
    }
}
