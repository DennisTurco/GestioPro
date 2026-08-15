using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/contract-renewals")]
public class ContractRenewalController(IContractRenewalService contractRenewalService) : ControllerBase
{
    /// <summary>
    /// Returns all renewals for a given contract
    /// </summary>
    /// <param name="contractId">Contract ID</param>
    [HttpGet("{contractId:long}")]
    public async Task<IActionResult> GetByContractId(long contractId)
    {
        var result = await contractRenewalService.GetByContractIdAsync(contractId);
        return Ok(result);
    }

    /// <summary>
    /// Deletes a renewal
    /// </summary>
    /// <param name="id">Renewal ID</param>
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        await contractRenewalService.DeleteAsync(id);
        return NoContent();
    }
}
