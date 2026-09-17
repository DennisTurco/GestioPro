using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1")]
public class CustomerDocumentController(ICustomerDocumentService customerDocumentService) : ControllerBase
{
    /// <summary>
    /// Returns all documents attached to a customer
    /// </summary>
    /// <param name="customerId">Customer ID</param>
    [HttpGet("customers/{customerId:long}/documents")]
    public async Task<IActionResult> GetByCustomerId(long customerId)
    {
        var result = await customerDocumentService.GetByCustomerIdAsync(customerId);
        return Ok(result);
    }

    /// <summary>
    /// Uploads a new document for a customer
    /// </summary>
    /// <param name="customerId">Customer ID</param>
    /// <param name="file">File to upload</param>
    [HttpPost("customers/{customerId:long}/documents")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<IActionResult> Upload(long customerId, IFormFile file)
    {
        if (file is null || file.Length == 0)
            throw new ValidationException("Nessun file selezionato");

        await using var stream = file.OpenReadStream();
        var result = await customerDocumentService.UploadAsync(customerId, file.FileName, file.ContentType, file.Length, stream);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>
    /// Downloads a customer document
    /// </summary>
    /// <param name="id">Document ID</param>
    [HttpGet("customer-documents/{id:long}/download")]
    public async Task<IActionResult> Download(long id)
    {
        var (content, contentType, fileName) = await customerDocumentService.DownloadAsync(id);
        return File(content, contentType, fileName);
    }

    /// <summary>
    /// Deletes a customer document
    /// </summary>
    /// <param name="id">Document ID</param>
    [HttpDelete("customer-documents/{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        await customerDocumentService.DeleteAsync(id);
        return NoContent();
    }
}
